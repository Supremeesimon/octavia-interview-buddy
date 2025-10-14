import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Function to regenerate tokens on demand via HTTP request
exports.regenerateTokensOnDemand = functions.https.onRequest(async (req, res) => {
  // Check for authorization header
  const authHeader = req.get('Authorization');
  const expectedToken = functions.config().regeneration.secret;
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  try {
    console.log('Starting on-demand token regeneration for all institutions...');
    
    // Get all institutions
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.get();
    
    console.log(`Found ${snapshot.size} institutions to update`);
    
    let updatedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      try {
        // Generate new token and link
        const newToken = uuidv4();
        const newLink = `https://your-domain.com/signup-institution/${newToken}`;
        
        // Update the institution document
        await docSnap.ref.update({
          customSignupToken: newToken,
          customSignupLink: newLink,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Updated institution ${docSnap.id} with new token`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating institution ${docSnap.id}:`, error);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} institutions`);
    res.status(200).send(`Successfully updated ${updatedCount} institutions`);
  } catch (error) {
    console.error('Error regenerating institution tokens:', error);
    res.status(500).send('Error regenerating tokens');
  }
});

// Function to regenerate token when a new institution is created
exports.onInstitutionCreate = functions.firestore
  .document('institutions/{institutionId}')
  .onCreate(async (snap, context) => {
    try {
      const institutionData = snap.data();
      
      // Check if the institution already has a token and link
      if (!institutionData.customSignupToken || !institutionData.customSignupLink) {
        // Generate new token and link
        const newToken = uuidv4();
        const newLink = `https://your-domain.com/signup-institution/${newToken}`;
        
        // Update the institution document
        await snap.ref.update({
          customSignupToken: newToken,
          customSignupLink: newLink,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Generated signup token for new institution ${snap.id}`);
      }
      
      return null;
    } catch (error) {
      console.error('Error generating token for new institution:', error);
      return null;
    }
  });

// Function to regenerate token when an institution is updated (if needed)
exports.onInstitutionUpdate = functions.firestore
  .document('institutions/{institutionId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      // If the institution was approved, ensure it has a valid token
      if (beforeData.approvalStatus !== 'approved' && afterData.approvalStatus === 'approved') {
        // Generate new token and link
        const newToken = uuidv4();
        const newLink = `https://your-domain.com/signup-institution/${newToken}`;
        
        // Update the institution document
        await change.after.ref.update({
          customSignupToken: newToken,
          customSignupLink: newLink,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Regenerated signup token for approved institution ${change.after.id}`);
      }
      
      return null;
    } catch (error) {
      console.error('Error regenerating token for updated institution:', error);
      return null;
    }
  });