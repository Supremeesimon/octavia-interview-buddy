import { serperService, SerperJobResult } from './serper.service';

/**
 * Service for generating job recommendations based on resume data
 */
class JobRecommendationService {
  /**
   * Get job recommendations based on skills and location extracted from resume
   */
  async getJobRecommendations(skills: string[], location: string, limit: number = 10): Promise<SerperJobResult[]> {
    try {
      // Use Serper API to search for jobs based on skills and location
      const jobs = await serperService.searchJobs(skills, location, limit);
      
      // If no jobs found, return an empty array
      if (!jobs || jobs.length === 0) {
        console.log(`No jobs found for skills: [${skills.join(', ')}] in location: ${location}`);
        return [];
      }
      
      console.log(`Found ${jobs.length} jobs for skills: [${skills.join(', ')}] in location: ${location}`);
      return jobs;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      // Return empty array in case of error to allow graceful degradation
      return [];
    }
  }

  /**
   * Get a specific number of recommended jobs with additional filtering
   */
  async getRecommendedJobs(skills: string[], location: string, count: number = 5): Promise<SerperJobResult[]> {
    try {
      // Get more jobs than requested to allow for filtering
      const jobs = await this.getJobRecommendations(skills, location, count * 2);
      
      // Filter and sort jobs as needed
      // For now, we'll just return the first 'count' jobs
      return jobs.slice(0, count);
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      return [];
    }
  }
}

export const jobRecommendationService = new JobRecommendationService();
export { SerperJobResult } from './serper.service';

// Export the function for backward compatibility
export const getJobRecommendations = jobRecommendationService.getJobRecommendations;