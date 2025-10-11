import { interviewService } from '@/services/interview.service';
import { InstitutionService } from '@/services/institution.service';
import { Institution } from '@/types';

export class AIAnalyticsService {
  private static instance: AIAnalyticsService;
  private geminiApiKey: string | null = null;

  private constructor() {}

  public static getInstance(): AIAnalyticsService {
    if (!AIAnalyticsService.instance) {
      AIAnalyticsService.instance = new AIAnalyticsService();
    }
    return AIAnalyticsService.instance;
  }

  /**
   * Set the Gemini API key
   */
  setGeminiApiKey(apiKey: string): void {
    this.geminiApiKey = apiKey;
  }

  /**
   * Fetch real performance data from Firebase
   */
  async getPerformanceData(): Promise<any[]> {
    try {
      // Fetch all end-of-call analyses
      const analyses = await interviewService.getAllAnalyses(1000);
      
      // Group by category and calculate averages
      const categoryScores: Record<string, { total: number; count: number }> = {};
      
      analyses.forEach(analysis => {
        if (analysis.categories && Array.isArray(analysis.categories)) {
          analysis.categories.forEach((category: any) => {
            if (category.name && typeof category.score === 'number') {
              if (!categoryScores[category.name]) {
                categoryScores[category.name] = { total: 0, count: 0 };
              }
              categoryScores[category.name].total += category.score;
              categoryScores[category.name].count += 1;
            }
          });
        }
      });
      
      // Convert to array format
      return Object.entries(categoryScores).map(([category, data]) => ({
        category,
        score: Math.round(data.total / data.count)
      }));
    } catch (error) {
      console.error('Error fetching performance data:', error);
      return [];
    }
  }

  /**
   * Fetch real trend data from Firebase
   */
  async getTrendData(): Promise<any[]> {
    try {
      // Fetch all end-of-call analyses
      const analyses = await interviewService.getAllAnalyses(1000);
      
      // Group by month and calculate metrics
      const monthlyData: Record<string, { interviews: number; totalScore: number; completionCount: number }> = {};
      
      analyses.forEach(analysis => {
        const date = new Date(analysis.timestamp || analysis.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { interviews: 0, totalScore: 0, completionCount: 0 };
        }
        
        monthlyData[monthKey].interviews += 1;
        if (typeof analysis.overallScore === 'number') {
          monthlyData[monthKey].totalScore += analysis.overallScore;
          monthlyData[monthKey].completionCount += 1;
        }
      });
      
      // Convert to array format sorted by date
      return Object.entries(monthlyData)
        .map(([key, data]) => {
          const [year, month] = key.split('-');
          const monthLabel = new Date(parseInt(year), parseInt(month)).toLocaleString('default', { month: 'short' });
          return {
            month: monthLabel,
            interviews: data.interviews,
            completionRate: data.completionCount > 0 ? Math.round((data.completionCount / data.interviews) * 100) : 0
          };
        })
        .sort((a, b) => {
          const aDate = new Date(`01 ${a.month} 2020`);
          const bDate = new Date(`01 ${b.month} 2020`);
          return aDate.getTime() - bDate.getTime();
        });
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
  }

  /**
   * Fetch real institution data from Firebase
   */
  async getInstitutionData(): Promise<any[]> {
    try {
      // Fetch all institutions
      const institutions = await InstitutionService.getAllInstitutions();
      
      // Convert to percentage format (this would be based on actual usage in a real system)
      return institutions.map((inst, index) => ({
        name: inst.name,
        value: Math.max(5, Math.round(100 / institutions.length)) // Distribute evenly for now
      }));
    } catch (error) {
      console.error('Error fetching institution data:', error);
      return [];
    }
  }

  /**
   * Fetch real institution performance data from Firebase
   */
  async getInstitutionPerformanceData(): Promise<any[]> {
    try {
      // Fetch all institutions
      const institutions = await InstitutionService.getAllInstitutions();
      
      // Get performance data for each institution
      return institutions.map(inst => ({
        name: inst.name,
        score: inst.stats?.averageScore || 0
      }));
    } catch (error) {
      console.error('Error fetching institution performance data:', error);
      return [];
    }
  }

  /**
   * Fetch real skill gaps data from Firebase
   */
  async getSkillGapsData(): Promise<any[]> {
    try {
      // Fetch all end-of-call analyses
      const analyses = await interviewService.getAllAnalyses(1000);
      
      // Collect all improvement areas
      const skillGaps: Record<string, number> = {};
      
      analyses.forEach(analysis => {
        if (analysis.improvements && Array.isArray(analysis.improvements)) {
          analysis.improvements.forEach((improvement: string) => {
            if (improvement) {
              skillGaps[improvement] = (skillGaps[improvement] || 0) + 1;
            }
          });
        }
      });
      
      // Convert to array format and sort by frequency
      return Object.entries(skillGaps)
        .map(([skill, count]) => ({
          name: skill,
          gap: Math.min(100, Math.round((count / analyses.length) * 100))
        }))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5); // Top 5 skill gaps
    } catch (error) {
      console.error('Error fetching skill gaps data:', error);
      return [];
    }
  }

  /**
   * Generate AI insights using Gemini
   */
  async generateAIInsights(data: any): Promise<string> {
    if (!this.geminiApiKey) {
      console.log('No Gemini API key set, returning mock insights');
      // Return mock insights if no API key is set
      return this.getMockInsights();
    }

    try {
      console.log('Generating AI insights with Gemini API');
      // Call Gemini API to generate insights
      const prompt = this.createPromptFromData(data);
      console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
      const insights = await this.callGeminiAPI(prompt);
      console.log('Received insights from Gemini:', insights.substring(0, 200) + '...');
      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to mock insights if API call fails
      return this.getMockInsights();
    }
  }

  /**
   * Create a prompt for Gemini based on the data
   */
  private createPromptFromData(data: any): string {
    const prompt = `You are an AI expert in educational technology and workforce development, analyzing interview practice platform data. Your task is to provide actionable insights for improving student interview performance and platform effectiveness.

Analyze the following interview platform data and provide insights in exactly this format:

1. EXECUTIVE SUMMARY: A concise 2-3 sentence overview of key findings

2. KEY OBSERVATIONS: 3-5 specific, data-driven observations about patterns and trends

3. STRATEGIC RECOMMENDATIONS: 3-5 actionable recommendations for platform administrators and educators

4. FORECASTED IMPACT: A brief projection of potential improvement if recommendations are implemented

DATA TO ANALYZE:

Performance Data (category scores out of 100):
${data.performanceData?.map((item: any) => `- ${item.category}: ${item.score}/100`).join('\n') || 'No data available'}

Trend Data (monthly usage):
${data.trendData?.map((item: any) => `- ${item.month}: ${item.interviews} interviews, ${item.completionRate}% completion rate`).join('\n') || 'No data available'}

Institution Data (usage distribution):
${data.institutionData?.map((item: any) => `- ${item.name}: ${item.value}% usage`).join('\n') || 'No data available'}

Skill Gaps (areas needing improvement):
${data.skillGapsData?.map((item: any) => `- ${item.name}: ${item.gap}% of students need improvement`).join('\n') || 'No data available'}

Important guidelines:
- Focus on educational and workforce development insights
- Prioritize actionable recommendations that platform administrators can implement
- Consider the needs of both students and educational institutions
- Keep responses concise but data-driven
- Do not use markdown formatting in your response`;
    
    console.log('Generated prompt:', prompt.substring(0, 500) + '...');
    return prompt;
  }

  /**
   * Call the Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not set');
    }

    console.log('Calling Gemini API with key:', this.geminiApiKey.substring(0, 10) + '...');
    
    // Use Gemini 1.5 Flash for cost-effective processing of large volumes of data
    // Flash is optimized for high-volume, real-time tasks and is more cost-effective than Pro
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Gemini API response:', JSON.stringify(result, null, 2));
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text returned from Gemini API:', JSON.stringify(result, null, 2));
      throw new Error('No text returned from Gemini API');
    }
    
    return text;
  }

  /**
   * Mock insights for when no API key is set
   */
  private getMockInsights(): string {
    return `Analysis of platform data reveals several key patterns and opportunities for enhancement. Overall engagement metrics show positive growth with increased session completion rates.

Key Observations:
- Usage Patterns: Peak platform usage occurs during weekday evenings.
- Performance Trends: Average student scores have shown improvement over time.
- Engagement Correlation: Students who complete multiple practice interviews show higher success rates.

Strategic Recommendations:
- Develop institution-specific resources based on identified skill gaps.
- Implement targeted messaging for users who haven't completed interviews recently.
- Focus on technical interview preparation resources, which show highest demand.`;
  }

  /**
   * Generate mock insights based on real data
   */
  private generateMockInsightsFromData(data: any): string {
    const performanceAvg = data.performanceData?.length 
      ? data.performanceData.reduce((sum: number, item: any) => sum + item.score, 0) / data.performanceData.length 
      : 0;
    
    const totalInterviews = data.trendData?.length 
      ? data.trendData.reduce((sum: number, item: any) => sum + item.interviews, 0) 
      : 0;
    
    return `Analysis of ${totalInterviews} interviews conducted across institutions reveals key patterns. Overall performance metrics show an average score of ${Math.round(performanceAvg)}%.

Key Observations:
- Usage Patterns: Platform usage varies by month with recent increases.
- Performance Trends: Average scores have stabilized around ${Math.round(performanceAvg)}%.
- Engagement Metrics: Completion rates show positive trends.

Strategic Recommendations:
- Focus on areas where skill gaps are most prominent.
- Implement targeted engagement strategies for underperforming segments.
- Continue to develop resources that address common improvement areas.`;
  }
}

// Export singleton instance
export const aiAnalyticsService = AIAnalyticsService.getInstance();