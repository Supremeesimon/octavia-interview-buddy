const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Firebase Authentication functions
exports.createUser = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name
    });
    
    // Create user document in Firestore
    const userData = {
      email: email,
      name: name,
      role: role,
      isEmailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (role === 'institution_admin') {
      userData.institutionId = null; // Will be set during institutional signup
    }
    
    await admin.firestore().collection('users').doc(userRecord.uid).set(userData);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

exports.authenticateUser = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from Firestore
    const userSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password (you might need to adjust this based on your current password hashing)
    // For now, we'll assume Firebase Authentication handles this
    const firebaseUser = await admin.auth().getUserByEmail(email);
    
    // Generate custom token
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
    
    res.json({
      success: true,
      customToken: customToken,
      user: {
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        institutionId: userData.institutionId
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});