import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { SignupRequest, LoginRequest, UserProfile, UserRole } from '@/types';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';

export class FirebaseAuthService {
  // Register new user
  async register(data: SignupRequest & { role?: UserRole, department?: string, yearOfStudy?: string }): Promise<{ user: UserProfile; token: string }> {
    try {
      // Create user with email and password
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const { user } = userCredential;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: data.name
      });

      // Determine user role based on email domain or explicit role selection
      let userRole: UserRole = 'student'; // default
      
      if (data.role) {
        // If an explicit role is provided, use it (with validation)
        if (data.role === 'platform_admin' || data.role === 'institution_admin' || data.role === 'student' || data.role === 'teacher') {
          userRole = data.role;
        }
      } else {
        // Otherwise, determine role based on email domain
        userRole = this.determineUserRole(data.email, data.institutionDomain);
      }

      // Create user document in the appropriate collection based on role
      const userProfile: UserProfile = {
        id: user.uid,
        name: data.name,
        email: data.email,
        role: userRole,
        institutionDomain: data.institutionDomain,
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
        // Only include department and yearOfStudy for institutional users
        ...(data.institutionDomain && {
          department: data.department,
          yearOfStudy: data.yearOfStudy
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        sessionCount: 0,
        profileCompleted: false
      };

      // Save user to appropriate collection based on role
      if (userRole === 'platform_admin') {
        await InstitutionHierarchyService.createPlatformAdmin(userProfile);
      } else if (!data.institutionDomain) {
        // External users (no institution affiliation)
        try {
          await InstitutionHierarchyService.createExternalUser({
            ...userProfile,
            authProvider: 'email'
          });
        } catch (error) {
          // If we fail to create the user document, we should delete the Firebase Auth user
          // to avoid having orphaned auth users
          try {
            await user.delete();
          } catch (deleteError) {
            // If we can't delete the user (e.g., token expired), log the error but continue
            console.warn('Failed to delete Firebase Auth user:', deleteError);
          }
          throw error;
        }
      } else {
        // For institutional users, we need to create them in the proper hierarchy
        try {
          // First, find the institution by name (trim to handle any extra spaces)
          const trimmedInstitutionName = data.institutionDomain?.trim() || '';
          const institutionsRef = collection(db, 'institutions');
          const q = query(institutionsRef, where('name', '==', trimmedInstitutionName));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // If institution doesn't exist, delete the Firebase Auth user and throw error
            console.log('Institution not found, deleting user');
            try {
              await user.delete();
            } catch (deleteError) {
              // If we can't delete the user (e.g., token expired), log the error but continue
              console.warn('Failed to delete Firebase Auth user:', deleteError);
            }
            throw new Error(`Institution "${trimmedInstitutionName}" not found.`);
          }
          
          const institutionDoc = querySnapshot.docs[0];
          const institutionId = institutionDoc.id;
          console.log(`Found institution "${trimmedInstitutionName}" with ID: ${institutionId}`);
          
          // Find or create department based on user input
          let targetDepartmentId = null;
          
          // Check if department name is provided and not empty
          if (data.department && data.department.trim()) {
            // If user specified a department, try to find an existing one with the same name
            // Trim the department name to handle any extra spaces and make it case-insensitive
            const trimmedDepartmentName = data.department.trim();
            const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
            const departmentQuery = query(departmentsRef, where('departmentName', '==', trimmedDepartmentName));
            let departmentSnapshot = await getDocs(departmentQuery);
            
            // If not found, try case-insensitive search
            if (departmentSnapshot.empty) {
              const allDepartmentsSnapshot = await getDocs(departmentsRef);
              const matchingDepartment = allDepartmentsSnapshot.docs.find(doc => 
                doc.data().departmentName.toLowerCase() === trimmedDepartmentName.toLowerCase()
              );
              
              if (matchingDepartment) {
                departmentSnapshot = {
                  empty: false,
                  docs: [matchingDepartment]
                } as any;
              }
            }
            
            if (!departmentSnapshot.empty) {
              // Found existing department with the same name
              targetDepartmentId = departmentSnapshot.docs[0].id;
              console.log(`Found existing department "${trimmedDepartmentName}" with ID: ${targetDepartmentId}`);
            } else {
              // Create a new department with the specified name
              const newDepartmentRef = doc(departmentsRef);
              await setDoc(newDepartmentRef, {
                departmentName: trimmedDepartmentName,
                createdAt: serverTimestamp(),
                createdBy: 'user-registration'
              });
              targetDepartmentId = newDepartmentRef.id;
              console.log(`Created new department "${trimmedDepartmentName}" with ID: ${targetDepartmentId}`);
            }
          } else {
            // No department specified, try to find an existing department or create a default one
            const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
            const departmentsSnapshot = await getDocs(departmentsRef);
            
            if (!departmentsSnapshot.empty) {
              targetDepartmentId = departmentsSnapshot.docs[0].id;
            } else {
              // Create a default department if none exists
              const defaultDepartmentRef = doc(departmentsRef);
              await setDoc(defaultDepartmentRef, {
                departmentName: 'General',
                createdAt: serverTimestamp(),
                createdBy: 'system'
              });
              targetDepartmentId = defaultDepartmentRef.id;
            }
          }
          
          // Create user based on role
          const { id, ...userData } = userProfile;
          if (userRole === 'institution_admin') {
            // Trim the department name for admins
            const adminDepartment = (data.department || 'General').trim() || 'General';
            await InstitutionHierarchyService.createInstitutionAdmin(institutionId, id, {
              ...userData,
              role: 'institution_admin',
              department: adminDepartment
            });
          } else if (userRole === 'teacher') {
            // Trim the department name for teachers
            const teacherDepartment = (data.department || 'General').trim() || 'General';
            await InstitutionHierarchyService.createTeacher(institutionId, targetDepartmentId, id, {
              ...userData,
              role: 'teacher',
              department: teacherDepartment
            });
          } else {
            // Default to student role
            // Trim the department name for students
            const studentDepartment = (data.department || 'General').trim() || 'General';
            await InstitutionHierarchyService.createStudent(institutionId, targetDepartmentId, id, {
              ...userData,
              role: 'student',
              department: studentDepartment,
              yearOfStudy: data.yearOfStudy || new Date().getFullYear().toString()
            });
          }
        } catch (error) {
          // If we fail to create the institutional user, delete the Firebase Auth user
          // to avoid having orphaned auth users
          try {
            await user.delete();
          } catch (deleteError) {
            // If we can't delete the user (e.g., token expired), log the error but continue
            console.warn('Failed to delete Firebase Auth user:', deleteError);
          }
          throw error;
        }
      }

      // Send email verification
      await sendEmailVerification(user);

      // Get Firebase token
      const token = await user.getIdToken();

      return { user: userProfile, token };
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Login user
  async login(data: LoginRequest): Promise<{ user: UserProfile; token: string }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const { user } = userCredential;

      // Get user profile from Firestore by searching all possible locations
      const userSearchResult = await InstitutionHierarchyService.findUserById(user.uid);
      
      if (!userSearchResult) {
        // User exists in Firebase Auth but not in Firestore
        // This can happen if registration was interrupted
        // Create a minimal user profile with a better role determination
        
        // Try to determine the user's intended role
        // First, check if we can get any hints from the email
        const inferredRole = this.determineUserRole(user.email || '');
        
        const minimalProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
          email: user.email || '',
          role: inferredRole,
          emailVerified: user.emailVerified,
          isEmailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          sessionCount: 0,
          profileCompleted: false
        };

        // Save the minimal profile to appropriate collection based on role
        if (inferredRole === 'platform_admin') {
          await InstitutionHierarchyService.createPlatformAdmin(minimalProfile);
        } else {
          // For all other roles without institution domain, create as external user
          try {
            await InstitutionHierarchyService.createExternalUser({
              ...minimalProfile,
              authProvider: 'email'
            });
          } catch (error) {
            // If we fail to create the user document, log the error but don't throw
            // as the user can still log in, they just won't have a profile
            console.error('Failed to create minimal external user profile:', error);
          }
        }

        // Get Firebase token
        const token = await user.getIdToken();

        return { user: minimalProfile, token };
      }

      const userProfile = userSearchResult.user;

      // Update last login time in the appropriate collection
      if (userSearchResult.role === 'platform_admin') {
        await setDoc(doc(db, 'platformAdmins', user.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      } else if (userSearchResult.role === 'student' && !userSearchResult.institutionId) {
        // External student
        await setDoc(doc(db, 'externalUsers', user.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      } else if (userSearchResult.institutionId) {
        // Institutional user
        if (userSearchResult.role === 'institution_admin') {
          await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'admins', user.uid), {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } else if (userSearchResult.role === 'teacher' && userSearchResult.departmentId) {
          await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'departments', userSearchResult.departmentId, 'teachers', user.uid), {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } else if (userSearchResult.role === 'student' && userSearchResult.departmentId) {
          await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'departments', userSearchResult.departmentId, 'students', user.uid), {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        }
      }

      // Get Firebase token
      const token = await user.getIdToken();

      return { user: userProfile, token };
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // OAuth login with Google
  async loginWithGoogle(institutionContext?: { institutionName?: string, userType?: string }): Promise<{ user: UserProfile; token: string }> {
    console.log('loginWithGoogle called with context:', institutionContext);
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Configure provider to use popup instead of redirect
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      console.log('Google authentication successful for user:', user);

      // Check if user already exists in our Firestore by searching all possible locations
      const userSearchResult = await InstitutionHierarchyService.findUserById(user.uid);
      console.log('User search result:', userSearchResult);
      
      let userProfile: UserProfile;
      
      if (!userSearchResult) {
        // Create new user profile for OAuth user
        const userRole: UserRole = this.determineUserRole(user.email || '');
        console.log('Creating new user profile with role:', userRole);
        
        userProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
          email: user.email || '',
          role: userRole,
          institutionDomain: user.email?.split('@')[1],
          emailVerified: user.emailVerified,
          isEmailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          sessionCount: 0,
          profileCompleted: false
        };

        // If we have institutional context, create user in the institutional hierarchy
        if (institutionContext?.institutionName) {
          console.log('Institutional context provided:', institutionContext);
          // For institutional signup via Google, we need to determine the proper role
          // based on the userType parameter or default to student
          const userType = institutionContext.userType || 'student';
          console.log('User type:', userType);
          
          try {
            // First, we need to find the institution by name
            // Trim the institution name to handle any trailing/leading spaces
            const trimmedInstitutionName = institutionContext.institutionName.trim();
            const institutionsRef = collection(db, 'institutions');
            const q = query(institutionsRef, where('name', '==', trimmedInstitutionName));
            console.log('Searching for institution:', trimmedInstitutionName);
            const querySnapshot = await getDocs(q);
            console.log('Query results:', querySnapshot.size);
            
            if (querySnapshot.empty) {
              // If institution doesn't exist, delete the Firebase Auth user and throw error
              console.log('Institution not found, deleting user');
              try {
                await user.delete();
              } catch (deleteError) {
                // If we can't delete the user (e.g., token expired), log the error but continue
                console.warn('Failed to delete Firebase Auth user:', deleteError);
              }
              throw new Error(`Institution "${trimmedInstitutionName}" not found.`);
            }
            
            const institutionDoc = querySnapshot.docs[0];
            const institutionId = institutionDoc.id;
            console.log('Found institution with ID:', institutionId);
            
            // For now, we'll create users without specific departments
            // In a real implementation, you might want to prompt for department selection
            const departmentId = null;
            
            // Create user based on user type and store the result
            let createdUser: UserProfile | null = null;
            
            if (userType === 'student') {
              console.log('Creating student user');
              // For students, we need to place them in a department
              // Find or create department based on user profile data
              let targetDepartmentId = null;
              
              // Check if user profile has department info
              const userDepartment = userProfile.department;
              if (userDepartment) {
                // Try to find an existing department with the same name (case-insensitive)
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentQuery = query(departmentsRef, where('departmentName', '==', userDepartment));
                let departmentSnapshot = await getDocs(departmentQuery);
                
                // If not found, try case-insensitive search
                if (departmentSnapshot.empty) {
                  const allDepartmentsSnapshot = await getDocs(departmentsRef);
                  const matchingDepartment = allDepartmentsSnapshot.docs.find(doc => 
                    doc.data().departmentName.toLowerCase() === userDepartment.toLowerCase()
                  );
                  
                  if (matchingDepartment) {
                    departmentSnapshot = {
                      empty: false,
                      docs: [matchingDepartment]
                    } as any;
                  }
                }
                
                if (!departmentSnapshot.empty) {
                  // Found existing department with the same name
                  targetDepartmentId = departmentSnapshot.docs[0].id;
                  console.log(`Found existing department "${userDepartment}" with ID: ${targetDepartmentId}`);
                } else {
                  // Create a new department with the specified name
                  const newDepartmentRef = doc(departmentsRef);
                  await setDoc(newDepartmentRef, {
                    departmentName: userDepartment,
                    createdAt: serverTimestamp(),
                    createdBy: 'oauth-registration'
                  });
                  targetDepartmentId = newDepartmentRef.id;
                  console.log(`Created new department "${userDepartment}" with ID: ${targetDepartmentId}`);
                }
              } else {
                // No department specified, try to find an existing department or create a default one
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentsSnapshot = await getDocs(departmentsRef);
                console.log('Department search results:', departmentsSnapshot.size);
                
                if (!departmentsSnapshot.empty) {
                  targetDepartmentId = departmentsSnapshot.docs[0].id;
                } else {
                  // Create a default department if none exists
                  console.log('Creating default department');
                  const defaultDepartmentRef = doc(departmentsRef);
                  await setDoc(defaultDepartmentRef, {
                    departmentName: 'General',
                    createdAt: serverTimestamp(),
                    createdBy: 'system'
                  });
                  targetDepartmentId = defaultDepartmentRef.id;
                }
              }
              console.log('Target department ID:', targetDepartmentId);
              
              // Extract the user ID and pass it separately
              const { id, ...studentData } = userProfile;
              await InstitutionHierarchyService.createStudent(institutionId, targetDepartmentId, id, {
                ...studentData,
                role: 'student',
                department: userDepartment || 'General',
                yearOfStudy: new Date().getFullYear().toString()
              });
              
              // Set the created user profile with the correct role and institution info
              createdUser = {
                ...userProfile,
                role: 'student'
              };
            } else if (userType === 'teacher') {
              console.log('Creating teacher user');
              // For teachers, we need to place them in a department
              // Find or create department based on user profile data
              let targetDepartmentId = null;
              
              // Check if user profile has department info
              const userDepartment = userProfile.department;
              if (userDepartment) {
                // Try to find an existing department with the same name (case-insensitive)
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentQuery = query(departmentsRef, where('departmentName', '==', userDepartment));
                let departmentSnapshot = await getDocs(departmentQuery);
                
                // If not found, try case-insensitive search
                if (departmentSnapshot.empty) {
                  const allDepartmentsSnapshot = await getDocs(departmentsRef);
                  const matchingDepartment = allDepartmentsSnapshot.docs.find(doc => 
                    doc.data().departmentName.toLowerCase() === userDepartment.toLowerCase()
                  );
                  
                  if (matchingDepartment) {
                    departmentSnapshot = {
                      empty: false,
                      docs: [matchingDepartment]
                    } as any;
                  }
                }
                
                if (!departmentSnapshot.empty) {
                  // Found existing department with the same name
                  targetDepartmentId = departmentSnapshot.docs[0].id;
                  console.log(`Found existing department "${userDepartment}" with ID: ${targetDepartmentId}`);
                } else {
                  // Create a new department with the specified name
                  const newDepartmentRef = doc(departmentsRef);
                  await setDoc(newDepartmentRef, {
                    departmentName: userDepartment,
                    createdAt: serverTimestamp(),
                    createdBy: 'oauth-registration'
                  });
                  targetDepartmentId = newDepartmentRef.id;
                  console.log(`Created new department "${userDepartment}" with ID: ${targetDepartmentId}`);
                }
              } else {
                // No department specified, try to find an existing department or create a default one
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentsSnapshot = await getDocs(departmentsRef);
                console.log('Department search results:', departmentsSnapshot.size);
                
                if (!departmentsSnapshot.empty) {
                  targetDepartmentId = departmentsSnapshot.docs[0].id;
                } else {
                  // Create a default department if none exists
                  console.log('Creating default department');
                  const defaultDepartmentRef = doc(departmentsRef);
                  await setDoc(defaultDepartmentRef, {
                    departmentName: 'General',
                    createdAt: serverTimestamp(),
                    createdBy: 'system'
                  });
                  targetDepartmentId = defaultDepartmentRef.id;
                }
              }
              console.log('Target department ID:', targetDepartmentId);
              
              // Extract the user ID and pass it separately
              const { id, ...teacherData } = userProfile;
              await InstitutionHierarchyService.createTeacher(institutionId, targetDepartmentId, id, {
                ...teacherData,
                role: 'teacher',
                department: userDepartment || 'General'
              });
              
              // Set the created user profile with the correct role and institution info
              createdUser = {
                ...userProfile,
                role: 'teacher'
              };
            } else if (userType === 'admin') {
              console.log('Creating admin user');
              // For admins, create in the institution's admins subcollection
              // Extract the user ID and pass it separately
              const { id, ...adminData } = userProfile;
              await InstitutionHierarchyService.createInstitutionAdmin(institutionId, id, {
                ...adminData,
                role: 'institution_admin'
              });
              
              // Set the created user profile with the correct role and institution info
              createdUser = {
                ...userProfile,
                role: 'institution_admin'
              };
            } else {
              console.log('Creating default student user');
              // For unknown user types, default to student
              // For students, we need to place them in a department
              // Find or create department based on user profile data
              let targetDepartmentId = null;
              
              // Check if user profile has department info
              const userDepartment = userProfile.department;
              if (userDepartment) {
                // Try to find an existing department with the same name (case-insensitive)
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentQuery = query(departmentsRef, where('departmentName', '==', userDepartment));
                let departmentSnapshot = await getDocs(departmentQuery);
                
                // If not found, try case-insensitive search
                if (departmentSnapshot.empty) {
                  const allDepartmentsSnapshot = await getDocs(departmentsRef);
                  const matchingDepartment = allDepartmentsSnapshot.docs.find(doc => 
                    doc.data().departmentName.toLowerCase() === userDepartment.toLowerCase()
                  );
                  
                  if (matchingDepartment) {
                    departmentSnapshot = {
                      empty: false,
                      docs: [matchingDepartment]
                    } as any;
                  }
                }
                
                if (!departmentSnapshot.empty) {
                  // Found existing department with the same name
                  targetDepartmentId = departmentSnapshot.docs[0].id;
                  console.log(`Found existing department "${userDepartment}" with ID: ${targetDepartmentId}`);
                } else {
                  // Create a new department with the specified name
                  const newDepartmentRef = doc(departmentsRef);
                  await setDoc(newDepartmentRef, {
                    departmentName: userDepartment,
                    createdAt: serverTimestamp(),
                    createdBy: 'oauth-registration'
                  });
                  targetDepartmentId = newDepartmentRef.id;
                  console.log(`Created new department "${userDepartment}" with ID: ${targetDepartmentId}`);
                }
              } else {
                // No department specified, try to find an existing department or create a default one
                const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
                const departmentsSnapshot = await getDocs(departmentsRef);
                console.log('Department search results:', departmentsSnapshot.size);
                
                if (!departmentsSnapshot.empty) {
                  targetDepartmentId = departmentsSnapshot.docs[0].id;
                } else {
                  // Create a default department if none exists
                  console.log('Creating default department');
                  const defaultDepartmentRef = doc(departmentsRef);
                  await setDoc(defaultDepartmentRef, {
                    departmentName: 'General',
                    createdAt: serverTimestamp(),
                    createdBy: 'system'
                  });
                  targetDepartmentId = defaultDepartmentRef.id;
                }
              }
              console.log('Target department ID:', targetDepartmentId);
              
              // Extract the user ID and pass it separately
              const { id, ...studentData } = userProfile;
              await InstitutionHierarchyService.createStudent(institutionId, targetDepartmentId, id, {
                ...studentData,
                role: 'student',
                department: userDepartment || 'General',
                yearOfStudy: new Date().getFullYear().toString()
              });
              
              // Set the created user profile with the correct role and institution info
              createdUser = {
                ...userProfile,
                role: 'student'
              };
            }
            
            // Use the created user profile instead of searching again
            userProfile = createdUser || userProfile;
          } catch (error) {
            console.error('Error creating institutional user:', error);
            // If we fail to create the institutional user, delete the Firebase Auth user
            // to avoid having orphaned auth users
            try {
              await user.delete();
            } catch (deleteError) {
              // If we can't delete the user (e.g., token expired), log the error but continue
              console.warn('Failed to delete Firebase Auth user:', deleteError);
            }
            throw error;
          }
        } else {
          console.log('No institutional context, creating external user');
          // OAuth users are external users (not institutional)
          // We need to set the authProvider to 'gmail' for Google OAuth users
          try {
            const { id, ...externalUserData } = userProfile;
            await InstitutionHierarchyService.createExternalUser({
              ...externalUserData,
              authProvider: 'gmail'
            });
          } catch (error) {
            console.error('Error creating external user:', error);
            // If we fail to create the user document, we should delete the Firebase Auth user
            // to avoid having orphaned auth users
            try {
              await user.delete();
            } catch (deleteError) {
              // If we can't delete the user (e.g., token expired), log the error but continue
              console.warn('Failed to delete Firebase Auth user:', deleteError);
            }
            throw error;
          }
        }
      } else {
        // Update existing user's last login time
        userProfile = userSearchResult.user;
        
        if (userSearchResult.role === 'platform_admin') {
          await setDoc(doc(db, 'platformAdmins', user.uid), {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } else if (userSearchResult.role === 'student' && !userSearchResult.institutionId) {
          // External student
          await setDoc(doc(db, 'externalUsers', user.uid), {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } else if (userSearchResult.institutionId) {
          // Institutional user
          if (userSearchResult.role === 'institution_admin') {
            await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'admins', user.uid), {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          } else if (userSearchResult.role === 'teacher' && userSearchResult.departmentId) {
            await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'departments', userSearchResult.departmentId, 'teachers', user.uid), {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          } else if (userSearchResult.role === 'student' && userSearchResult.departmentId) {
            await setDoc(doc(db, 'institutions', userSearchResult.institutionId, 'departments', userSearchResult.departmentId, 'students', user.uid), {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          }
        }
      }

      // Get Firebase token
      const token = await user.getIdToken();

      return { user: userProfile, token };
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Enroll user in TOTP MFA
  async enrollTotpMfa(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Check if user already has TOTP enrolled
      const multiFactorUser = multiFactor(user);
      const factors = multiFactorUser.enrolledFactors;
      
      if (factors.some(factor => factor.factorId === 'totp')) {
        throw new Error('TOTP MFA is already enrolled for this user');
      }

      // Generate TOTP secret
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorUser);
      
      // Return the secret key (in a real app, you would display a QR code)
      return totpSecret.secretKey;
    } catch (error) {
      throw new Error(`Failed to enroll TOTP MFA: ${error.message}`);
    }
  }

  // Verify and complete TOTP enrollment
  async verifyTotpEnrollment(verificationCode: string, totpSecret: TotpSecret): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Create TOTP multi-factor assertion
      const totpMultiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode
      );

      // Enroll the TOTP factor
      const multiFactorUser = multiFactor(user);
      await multiFactorUser.enroll(totpMultiFactorAssertion);
    } catch (error) {
      throw new Error(`Failed to verify TOTP enrollment: ${error.message}`);
    }
  }

  // Enroll user in Phone MFA
  async enrollPhoneMfa(phoneNumber: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Check if user already has this phone number enrolled
      const multiFactorUser = multiFactor(user);
      const factors = multiFactorUser.enrolledFactors;
      
      if (factors.some(factor => 
        factor.factorId === 'phone' && 
        (factor as any).phoneNumber === phoneNumber
      )) {
        throw new Error('This phone number is already enrolled for MFA');
      }

      // Create recaptcha verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });

      // Create phone auth provider
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      // Send verification code
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );

      return verificationId;
    } catch (error) {
      throw new Error(`Failed to enroll Phone MFA: ${error.message}`);
    }
  }

  // Verify and complete Phone enrollment
  async verifyPhoneEnrollment(verificationId: string, verificationCode: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // TODO: Fix MFA implementation
      // For now, we'll skip this implementation as it's not critical to the main issues
      throw new Error('Phone MFA enrollment is temporarily disabled');
      
      // Create phone multi-factor assertion
      // const phoneMultiFactorAssertion = PhoneMultiFactorGenerator.assertion(verificationCode);

      // Enroll the phone factor
      // const multiFactorUser = multiFactor(user);
      // await multiFactorUser.enroll(phoneMultiFactorAssertion, verificationId);
    } catch (error) {
      throw new Error(`Failed to verify Phone enrollment: ${error.message}`);
    }
  }

  // Get enrolled MFA factors
  async getEnrolledFactors(): Promise<any[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return [];
      }

      const multiFactorUser = multiFactor(user);
      return multiFactorUser.enrolledFactors;
    } catch (error) {
      throw new Error(`Failed to get enrolled factors: ${error.message}`);
    }
  }

  // Unenroll MFA factor
  async unenrollMfa(factorId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      const multiFactorUser = multiFactor(user);
      await multiFactorUser.unenroll(factorId);
    } catch (error) {
      throw new Error(`Failed to unenroll MFA factor: ${error.message}`);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Send password reset email
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<UserProfile | null> {
    console.log('FirebaseAuthService: Getting current user');
    const user = auth.currentUser;
    
    if (!user) {
      console.log('FirebaseAuthService: No current Firebase user');
      return null;
    }

    try {
      console.log('FirebaseAuthService: Searching for user document for', user.uid);
      const userSearchResult = await InstitutionHierarchyService.findUserById(user.uid);
      
      if (!userSearchResult) {
        console.log('FirebaseAuthService: User document does not exist for', user.uid);
        return null;
      }

      console.log('FirebaseAuthService: User data fetched', { userId: user.uid, hasData: !!userSearchResult.user });
      return userSearchResult.user;
    } catch (error) {
      console.error('FirebaseAuthService: Error getting current user:', error);
      // Even if we can't find the user in Firestore, we can still return a minimal profile
      // based on the Firebase Auth user data
      const minimalProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
        email: user.email || '',
        role: 'student', // Default role
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        sessionCount: 0,
        profileCompleted: false
      };
      return minimalProfile;
    }
  }

  // Get current Firebase user
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  }

  // Determine user role based on email domain
  // Note: This is a heuristic and may not always be accurate
  // Roles should ideally be set during registration based on user selection
  private determineUserRole(email: string, institutionDomain?: string): UserRole {
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Educational email domains - most likely students
    if (domain?.endsWith('.edu') || domain?.includes('.edu.')) {
      return 'student';
    }
    
    // Institution admin (specific domain provided)
    if (institutionDomain && domain === institutionDomain.toLowerCase()) {
      return 'institution_admin';
    }
    
    // Common institutional domains that might indicate teachers/admins
    const institutionalDomains = [
      'ac.uk', 'edu.au', 'edu.sg', 'edu.cn', 'edu.in', 
      'edu.br', 'edu.mx', 'edu.ar', 'edu.cl', 'edu.co',
      'edu.pe', 'edu.ve', 'edu.ec', 'edu.gt', 'edu.hn',
      'edu.ni', 'edu.pa', 'edu.py', 'edu.uy', 'edu.do'
    ];
    
    if (domain && institutionalDomains.some(instDomain => domain.endsWith(instDomain))) {
      return 'institution_admin';
    }
    
    // For common email providers, assume student unless there's other indication
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (domain && personalDomains.includes(domain)) {
      return 'student';
    }
    
    // For other domains, make an educated guess
    // If the domain doesn't look like a personal email, assume institutional role
    if (domain && !personalDomains.includes(domain)) {
      return 'institution_admin';
    }
    
    // Default to student for unknown domains
    return 'student';
  }

  // Handle Firebase auth errors
  private handleAuthError(error: AuthError | Error): Error {
    // Handle our custom errors first
    if (error instanceof Error) {
      // Check if it's our custom permission error
      if (error.message.includes('Missing or insufficient permissions')) {
        return new Error('Failed to create external user: Missing or insufficient permissions. Please contact support.');
      }
      
      // Check if it's our custom external user creation error
      if (error.message.includes('Failed to create external user')) {
        return error;
      }
    }
    
    // Handle Firebase Auth errors
    if ('code' in error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return new Error('This email is already registered. Please try: 1. Using a different email address, or 2. Going to the login page if you already have an account.');
        case 'auth/weak-password':
          return new Error('Password is too weak. Please use at least 6 characters');
        case 'auth/invalid-email':
          return new Error('Invalid email address');
        case 'auth/user-not-found':
          return new Error('No account found with this email address. Please check your email or sign up for a new account.');
        case 'auth/wrong-password':
          return new Error('Invalid email or password. Please check your credentials and try again.');
        case 'auth/too-many-requests':
          return new Error('Too many failed attempts. Please try again later');
        case 'auth/network-request-failed':
          return new Error('Network error. Please check your connection');
        case 'auth/popup-closed-by-user':
          return new Error('Sign in popup was closed before completing sign in');
        case 'auth/cancelled-popup-request':
          return new Error('Sign in popup was cancelled');
        case 'auth/multi-factor-auth-required':
          return new Error('Multi-factor authentication is required');
        case 'auth/multi-factor-info-not-found':
          return new Error('Multi-factor information not found');
        case 'auth/invalid-verification-code':
          return new Error('Invalid verification code');
        case 'auth/missing-verification-code':
          return new Error('Missing verification code');
        case 'auth/invalid-credential':
          return new Error('Invalid email or password. Please check your credentials and try again.');
        default:
          return new Error(error.message || 'Authentication failed');
      }
    }
    
    // Handle other errors
    return new Error(error.message || 'Authentication failed');
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();