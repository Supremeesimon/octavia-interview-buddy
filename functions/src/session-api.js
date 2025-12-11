const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Session API functions
exports.getSessionPurchases = functions.https.onRequest(async (req, res) => {
  try {
    // Check authentication (you'll need to implement proper auth middleware)
    const userId = req.get('Authorization')?.split('Bearer ')[1];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Get user to verify they're an institution admin
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'institution_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only institution administrators can access session purchases.'
      });
    }
    
    // Get session purchases for the user's institution
    const purchasesSnapshot = await admin.firestore()
      .collection('sessionPurchases')
      .where('institutionId', '==', userData.institutionId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const purchases = [];
    purchasesSnapshot.forEach(doc => {
      const purchaseData = doc.data();
      purchases.push({
        id: doc.id,
        ...purchaseData,
        createdAt: purchaseData.createdAt?.toDate() || null,
        updatedAt: purchaseData.updatedAt?.toDate() || null
      });
    });
    
    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get session purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching session purchases'
    });
  }
});

exports.createSessionPurchase = functions.https.onRequest(async (req, res) => {
  try {
    // Check authentication
    const userId = req.get('Authorization')?.split('Bearer ')[1];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Get user to verify they're an institution admin
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    const institutionId = userData.institutionId;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with an institution.'
      });
    }
    
    const { sessionCount, pricePerSession, paymentMethodId } = req.body;
    
    // Validate input
    if (!sessionCount || sessionCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Session count must be a positive number'
      });
    }
    
    if (!pricePerSession || pricePerSession <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per session must be a positive number'
      });
    }
    
    const totalAmount = sessionCount * pricePerSession;
    
    // Save session purchase record
    const purchaseData = {
      institutionId: institutionId,
      sessionCount: sessionCount,
      pricePerSession: pricePerSession,
      totalAmount: totalAmount,
      paymentMethodId: paymentMethodId || null,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const purchaseRef = await admin.firestore().collection('sessionPurchases').add(purchaseData);
    
    res.json({
      success: true,
      message: 'Session purchase initiated',
      data: {
        sessionId: purchaseRef.id
      }
    });
  } catch (error) {
    console.error('Create session purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating session purchase'
    });
  }
});

exports.getSessionPool = functions.https.onRequest(async (req, res) => {
  try {
    // Check authentication
    const userId = req.get('Authorization')?.split('Bearer ')[1];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Get user
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    const institutionId = userData.institutionId;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with an institution.'
      });
    }
    
    // Get session pool for institution
    const poolSnapshot = await admin.firestore()
      .collection('sessionPools')
      .where('institutionId', '==', institutionId)
      .limit(1)
      .get();
    
    if (poolSnapshot.empty) {
      // Return null data if no pool exists
      return res.json({
        success: true,
        data: null
      });
    }
    
    const poolDoc = poolSnapshot.docs[0];
    const poolData = poolDoc.data();
    
    const responseData = {
      totalSessions: poolData.totalSessions,
      usedSessions: poolData.usedSessions,
      availableSessions: poolData.totalSessions - poolData.usedSessions,
      lastUpdated: poolData.updatedAt?.toDate() || null
    };
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get session pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching session pool'
    });
  }
});