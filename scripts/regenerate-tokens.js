#!/usr/bin/env node

// This script regenerates all institutional signup tokens for enhanced security
// Run this script periodically or when needed to invalidate existing tokens

const { exec } = require('child_process');
const path = require('path');

// Function to run the regeneration script
async function regenerateTokens() {
  console.log('Starting institutional signup token regeneration...');
  
  try {
    // Run the TypeScript script using ts-node
    const command = `npx ts-node "${path.join(__dirname, 'regenerate-institution-tokens.ts')}"`;
    
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running token regeneration:', error);
        return;
      }
      
      if (stderr) {
        console.error('stderr:', stderr);
      }
      
      console.log('stdout:', stdout);
      console.log('Token regeneration completed successfully!');
    });
  } catch (error) {
    console.error('Failed to regenerate tokens:', error);
  }
}

// Run the function
regenerateTokens();