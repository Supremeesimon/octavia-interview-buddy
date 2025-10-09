import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { SignupRequest, LoginRequest, UserProfile, UserRole } from '@/types';

export class FirebaseAuthService {
  // Register new user
  async register(data: SignupRequest): Promise<{ user: UserProfile; token: string }> {
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

      // Determine user role based on email domain
      const userRole: UserRole = this.determineUserRole(data.email, data.institutionDomain);

      // Create user document in Firestore
      const userProfile: UserProfile = {
        id: user.uid,
        name: data.name,
        email: data.email,
        role: userRole,
        institutionDomain: data.institutionDomain,
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        sessionCount: 0,
        profileCompleted: false
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

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

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data() as UserProfile;

      // Update last login time
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      // Get Firebase token
      const token = await user.getIdToken();

      return { user: userProfile, token };
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
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
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current Firebase user
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  }

  // Determine user role based on email domain
  private determineUserRole(email: string, institutionDomain?: string): UserRole {
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Educational email domains
    if (domain?.endsWith('.edu') || domain?.includes('.edu.')) {
      return 'student';
    }
    
    // Institution admin (specific domain provided)
    if (institutionDomain && domain === institutionDomain.toLowerCase()) {
      return 'institution_admin';
    }
    
    // Default to student for unknown domains
    return 'student';
  }

  // Handle Firebase auth errors
  private handleAuthError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('Email address is already registered');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please use at least 6 characters');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/user-not-found':
        return new Error('No account found with this email address');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection');
      default:
        return new Error(error.message || 'Authentication failed');
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();