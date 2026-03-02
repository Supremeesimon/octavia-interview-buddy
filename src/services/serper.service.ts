import { getAuthToken } from '@/lib/auth';

interface SerperJobResult {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  posted: string;
  link: string;
  type: string;
  skills: string[];
}

interface SerperJobSearchResponse {
  jobs: SerperJobResult[];
  totalResults: number;
}

class SerperService {
  private readonly baseUrl = 'https://google.serper.dev';
  private readonly apiKey: string;

  constructor() {
    // In a real implementation, this would come from environment variables or secure storage
    this.apiKey = import.meta.env.VITE_SERPER_API_KEY || '';
  }

  /**
   * Search for jobs based on skills and location
   */
  async searchJobs(skills: string[], location: string, limit: number = 10): Promise<SerperJobResult[]> {
    if (!this.apiKey) {
      console.warn('Serper API key not configured, returning empty results');
      return [];
    }

    try {
      // Join skills with commas for the search query
      const skillsQuery = skills.join(', ');
      const query = `jobs for ${skillsQuery} in ${location}`;
      
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          q: query,
          gl: this.getCountryCode(location), // country code
          hl: 'en',
          num: limit,
          location: location
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API request failed: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      
      // Transform the response to our expected format
      const jobs: SerperJobResult[] = (data.jobs || []).map((job: any) => ({
        title: job.title || 'Job Title Not Available',
        company: job.company || 'Company Not Available',
        location: job.location || location, // Use original location if not specified
        salary: this.formatSalary(job.salary),
        description: jobdescription || job.snippet || 'No description available',
        posted: this.formatPostedDate(job.date),
        link: job.link || '#',
        type: job.job_type || 'Full-time',
        skills: job.skills || skills.slice(0, 5) // Use provided skills if job-specific skills aren't available
      }));

      return jobs.slice(0, limit);
    } catch (error) {
      console.error('Error searching jobs with Serper API:', error);
      // Return empty array in case of error, allowing graceful degradation
      return [];
    }
  }

  /**
   * Format salary information from API response
   */
  private formatSalary(salaryData: any): string {
    if (!salaryData) return 'Not specified';
    
    if (typeof salaryData === 'string') {
      return salaryData;
    }
    
    if (typeof salaryData === 'object') {
      const min = salaryData.min || salaryData.lowEstimate;
      const max = salaryData.max || salaryData.highEstimate;
      
      if (min && max) {
        return `$${Math.round(min/1000)}k - $${Math.round(max/1000)}k`;
      } else if (min) {
        return `From $${Math.round(min/1000)}k`;
      } else if (max) {
        return `Up to $${Math.round(max/1000)}k`;
      }
    }
    
    return 'Not specified';
  }

  /**
   * Format the posted date from API response
   */
  private formatPostedDate(dateString: string): string {
    if (!dateString) return 'Posted recently';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Posted yesterday';
      } else if (diffDays < 7) {
        return `Posted ${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Posted recently';
    }
  }

  /**
   * Get country code based on location for API request
   */
  private getCountryCode(location: string): string {
    // Simplified location to country mapping
    const lowerLocation = location.toLowerCase();
    
    if (lowerLocation.includes('us') || lowerLocation.includes('united states') || lowerLocation.includes('america')) {
      return 'US';
    } else if (lowerLocation.includes('uk') || lowerLocation.includes('united kingdom') || lowerLocation.includes('england')) {
      return 'GB';
    } else if (lowerLocation.includes('canada')) {
      return 'CA';
    } else if (lowerLocation.includes('australia')) {
      return 'AU';
    } else if (lowerLocation.includes('germany')) {
      return 'DE';
    } else if (lowerLocation.includes('france')) {
      return 'FR';
    } else if (lowerLocation.includes('nigeria')) {
      return 'NG';
    } else {
      // Default to US for unknown locations
      return 'US';
    }
  }
}

export const serperService = new SerperService();
export type { SerperJobResult, SerperJobSearchResponse };