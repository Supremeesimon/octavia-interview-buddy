import { InstitutionService } from '../services/institution.service';
import { PriceChangeService } from '../services/price-change.service';
import { PlatformSettingsService } from '../services/platform-settings.service';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use service account file
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Please ensure you have the firebase-service-account.json file in the project root');
    process.exit(1);
  }
}

const db = getFirestore();

async function checkInstitutions() {
  console.log('\n=== INSTITUTIONS COLLECTION ===');
  try {
    const institutions = await InstitutionService.getAllInstitutions();
    console.log(`Found ${institutions.length} institutions:`);
    
    institutions.forEach((institution, index) => {
      console.log(`${index + 1}. ${institution.name} (${institution.id})`);
      console.log(`   - Students: ${institution.stats?.totalStudents || 0}`);
      console.log(`   - Interviews: ${institution.stats?.totalInterviews || 0}`);
      console.log(`   - Status: ${institution.isActive ? 'Active' : 'Inactive'}`);
      if (institution.pricingOverride) {
        console.log(`   - Custom Pricing: Enabled`);
        console.log(`     VAPI Cost: $${institution.pricingOverride.customVapiCost}/min`);
        console.log(`     Markup: ${institution.pricingOverride.customMarkupPercentage}%`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
  }
}

async function checkPriceChanges() {
  console.log('\n=== SCHEDULED PRICE CHANGES COLLECTION ===');
  try {
    const priceChanges = await PriceChangeService.getAllPriceChanges();
    console.log(`Found ${priceChanges.length} price changes:`);
    
    priceChanges.forEach((change, index) => {
      console.log(`${index + 1}. ${change.changeType} change`);
      console.log(`   - ID: ${change.id}`);
      console.log(`   - Date: ${change.changeDate.toDateString()}`);
      console.log(`   - Affected: ${change.affected}`);
      console.log(`   - Current: ${change.currentValue}`);
      console.log(`   - New: ${change.newValue}`);
      console.log(`   - Status: ${change.status}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error fetching price changes:', error);
  }
}

async function checkPlatformSettings() {
  console.log('\n=== PLATFORM SETTINGS ===');
  try {
    const settings = await PlatformSettingsService.getPricingSettings();
    if (settings) {
      console.log('Current Platform Pricing Settings:');
      console.log(`- VAPI Cost per Minute: $${settings.vapiCostPerMinute}`);
      console.log(`- Markup Percentage: ${settings.markupPercentage}%`);
      console.log(`- Annual License Cost: $${settings.annualLicenseCost}`);
      console.log(`- Last Updated: ${settings.updatedAt}`);
    } else {
      console.log('No platform pricing settings found');
    }
  } catch (error) {
    console.error('Error fetching platform settings:', error);
  }
}

async function checkRawCollections() {
  console.log('\n=== RAW COLLECTION DATA ===');
  
  try {
    // Check institutions collection
    console.log('\nInstitutions collection documents:');
    const institutionsSnapshot = await db.collection('institutions').limit(5).get();
    institutionsSnapshot.forEach(doc => {
      console.log(`- ${doc.id}:`, doc.data());
    });
    
    // Check scheduled_price_changes collection
    console.log('\nScheduled price changes collection documents:');
    const priceChangesSnapshot = await db.collection('scheduled_price_changes').limit(5).get();
    priceChangesSnapshot.forEach(doc => {
      console.log(`- ${doc.id}:`, doc.data());
    });
    
    // Check platform_settings collection
    console.log('\nPlatform settings collection documents:');
    const settingsSnapshot = await db.collection('platform_settings').limit(5).get();
    settingsSnapshot.forEach(doc => {
      console.log(`- ${doc.id}:`, doc.data());
    });
  } catch (error) {
    console.error('Error fetching raw collection data:', error);
  }
}

async function main() {
  console.log('Checking latest data from Firebase collections...\n');
  
  await checkInstitutions();
  await checkPriceChanges();
  await checkPlatformSettings();
  await checkRawCollections();
  
  console.log('\nData check completed.');
}

// Run the script
main().catch(console.error);