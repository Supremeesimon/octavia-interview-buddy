import { interviewService } from '@/services/interview.service';

async function checkAnonymousInterviewData() {
  try {
    console.log('Checking for anonymous interview data in Firebase...');
    
    // Get all analyses (for development/testing only)
    const allAnalyses = await interviewService.getAllAnalyses(50);
    console.log(`Found ${allAnalyses.length} total analyses`);
    
    // Filter for anonymous users (those without studentId)
    const anonymousAnalyses = allAnalyses.filter(analysis => !analysis.studentId);
    console.log(`Found ${anonymousAnalyses.length} anonymous analyses`);
    
    // Display details of anonymous analyses
    if (anonymousAnalyses.length > 0) {
      console.log('\nAnonymous Interview Analyses:');
      anonymousAnalyses.forEach((analysis, index) => {
        console.log(`\n--- Analysis ${index + 1} ---`);
        console.log(`Call ID: ${analysis.callId}`);
        console.log(`Timestamp: ${analysis.timestamp}`);
        console.log(`Interview Type: ${analysis.interviewType}`);
        console.log(`Duration: ${analysis.duration} seconds`);
        console.log(`Overall Score: ${analysis.overallScore}`);
        console.log(`Summary: ${analysis.summary?.substring(0, 100)}...`);
        console.log(`Has Transcript: ${!!analysis.transcript}`);
        console.log(`Has Recording URL: ${!!analysis.recordingUrl}`);
        console.log(`Department ID: ${analysis.departmentId || 'None'}`);
        console.log(`Institution ID: ${analysis.institutionId || 'None'}`);
      });
    } else {
      console.log('No anonymous interview data found.');
    }
    
    // Also check interviews collection
    console.log('\nChecking interviews collection...');
    const recentInterviews = await interviewService.getRecentInterviews(20);
    console.log(`Found ${recentInterviews.length} recent interviews`);
    
    const anonymousInterviews = recentInterviews.filter(interview => !interview.studentId);
    console.log(`Found ${anonymousInterviews.length} anonymous interviews`);
    
    if (anonymousInterviews.length > 0) {
      console.log('\nAnonymous Interviews:');
      anonymousInterviews.forEach((interview, index) => {
        console.log(`\n--- Interview ${index + 1} ---`);
        console.log(`ID: ${interview.id}`);
        console.log(`Created: ${interview.createdAt}`);
        console.log(`Status: ${interview.status}`);
        console.log(`Type: ${interview.type}`);
        console.log(`Has Transcript: ${!!interview.transcript}`);
        console.log(`Has Recording: ${!!interview.recording}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking anonymous interview data:', error);
  }
}

// Run the check
checkAnonymousInterviewData();