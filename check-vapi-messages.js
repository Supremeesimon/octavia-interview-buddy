// Check VAPI messages in Firebase logs
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function checkVapiMessages() {
  try {
    // Get more detailed logs
    const { stdout, stderr } = await execPromise('firebase functions:log --only vapiWebhook --lines 50');
    
    if (stderr) {
      console.error('Error:', stderr);
      return;
    }
    
    const lines = stdout.split('\n');
    
    // Look for analysis-related messages
    const analysisMessages = lines.filter(line => 
      line.includes('analysis') || 
      line.includes('Analysis') ||
      line.includes('type') ||
      line.includes('message')
    );
    
    console.log('Recent VAPI messages:');
    console.log('====================');
    
    // Show the last 20 relevant lines
    analysisMessages.slice(-20).forEach(line => {
      console.log(line);
    });
    
    // Check if there are any error messages
    const errorMessages = lines.filter(line => 
      line.includes('error') || 
      line.includes('Error') ||
      line.includes('ERROR') ||
      line.includes('failed') ||
      line.includes('Failed')
    );
    
    if (errorMessages.length > 0) {
      console.log('\nError messages found:');
      console.log('====================');
      errorMessages.slice(-10).forEach(line => {
        console.log(line);
      });
    }
    
  } catch (error) {
    console.error('Error checking VAPI messages:', error);
  }
}

checkVapiMessages();