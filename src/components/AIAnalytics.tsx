import React, { useState, useEffect } from 'react';
import { 
  BarChart as BarChartIcon, 
  Brain, 
  TrendingUp, 
  Clock, 
  FileText, 
  Target, 
  BarChart2, 
  PieChart, 
  Building, 
  BookOpen 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, Tooltip, PieChart as ReChartPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { aiAnalyticsService } from '@/services/ai-analytics.service';
import { interviewService } from '@/services/interview.service';

const AIAnalytics = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [institutionData, setInstitutionData] = useState<any[]>([]);
  const [institutionPerformanceData, setInstitutionPerformanceData] = useState<any[]>([]);
  const [skillGapsData, setSkillGapsData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>({
    overallPerformanceGrade: 'N/A',
    gradeExplanation: 'No assessment available yet.',
    dataLinkingStatus: 'The collected data is not currently linked to specific institutional identifiers or individual student metadata. All analysis is based solely on two anonymous, aggregated reports.',
    studentImprovementAssessment: 'No assessment available yet.',
    keyInsight: 'No key insight available.'
  });
  const [loading, setLoading] = useState(true);

  // Debugging effect to monitor skillGapsData changes
  useEffect(() => {
    console.log('skillGapsData updated:', skillGapsData);
    console.log('skillGapsData length:', skillGapsData.length);
  }, [skillGapsData]);

  // Debugging effect to monitor all state changes
  useEffect(() => {
    console.log('Component state updated:', {
      performanceData: performanceData.length,
      trendData: trendData.length,
      institutionData: institutionData.length,
      institutionPerformanceData: institutionPerformanceData.length,
      skillGapsData: skillGapsData.length,
      loading
    });
  }, [performanceData, trendData, institutionData, institutionPerformanceData, skillGapsData, loading]);
  
  // State to track the actual number of interview analyses
  const [interviewAnalysesCount, setInterviewAnalysesCount] = useState<number>(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching analytics data...');
        
        // Fetch real data from Firebase
        const [perfData, trendData, instData, instPerfData, gapsData] = await Promise.all([
          aiAnalyticsService.getPerformanceData(),
          aiAnalyticsService.getTrendData(),
          aiAnalyticsService.getInstitutionData(),
          aiAnalyticsService.getInstitutionPerformanceData(),
          aiAnalyticsService.getSkillGapsData()
        ]);
        
        // Get the actual count of interview analyses
        const analyses = await interviewService.getAllAnalyses(1000);
        console.log('Actual interview analyses count:', analyses.length);
        setInterviewAnalysesCount(analyses.length);
        
        console.log('Fetched data:', { perfData, trendData, instData, instPerfData, gapsData });
        console.log('Skill gaps data length:', gapsData.length);
        console.log('Performance data length:', perfData.length);
        
        // Log the actual data being sent to AI for debugging
        const insightsData = {
          performanceData: perfData,
          trendData: trendData,
          institutionData: instData,
          skillGapsData: gapsData
        };
        
        // Log detailed data structure for debugging
        console.log('=== DETAILED DATA BEING SENT TO AI ===');
        console.log('Performance Data Count:', perfData.length);
        console.log('Performance Data:', JSON.stringify(perfData, null, 2));
        console.log('Trend Data Count:', trendData.length);
        console.log('Trend Data:', JSON.stringify(trendData, null, 2));
        console.log('Institution Data Count:', instData.length);
        console.log('Institution Data:', JSON.stringify(instData, null, 2));
        console.log('Skill Gaps Data Count:', gapsData.length);
        console.log('Skill Gaps Data:', JSON.stringify(gapsData, null, 2));
        console.log('=====================================');
        
        // Ensure skill gaps data is properly formatted
        const formattedGapsData = Array.isArray(gapsData) ? gapsData : [];
        console.log('Formatted skill gaps data:', formattedGapsData);
        
        setPerformanceData(perfData);
        setTrendData(trendData);
        setInstitutionData(instData);
        setInstitutionPerformanceData(instPerfData);
        setSkillGapsData(formattedGapsData);
        
        // Generate AI insights
        console.log('Generating AI insights with data:', JSON.stringify(insightsData, null, 2));
        const insights = await aiAnalyticsService.generateAIInsights(insightsData);
        console.log('Generated insights:', insights);
        setAiInsights(insights);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        console.log('Finished fetching data, setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderPieChart = () => {
    if (institutionData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No institution data available</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ReChartPieChart>
          <Pie
            data={institutionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {institutionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </ReChartPieChart>
      </ResponsiveContainer>
    );
  };
  
  if (loading) {
    console.log('Component is loading...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  console.log('Rendering component with data:', {
    performanceData: performanceData.length,
    trendData: trendData.length,
    institutionData: institutionData.length,
    institutionPerformanceData: institutionPerformanceData.length,
    skillGapsData: skillGapsData.length
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">AI & Analytics Insights</h2>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} w-full`}>
          <TabsTrigger value="overview">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="mr-2 h-4 w-4" />
            Skill Gaps
          </TabsTrigger>
          <TabsTrigger value="institutions">
            <Building className="mr-2 h-4 w-4" />
            Anonymous Data
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-6'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <CardDescription>Average scores across key performance areas</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ChartContainer
                    config={{
                      score: { color: "hsl(var(--primary))" },
                    }}
                    className="aspect-[4/3]"
                  >
                    <BarChart data={performanceData} layout="vertical">
                      <XAxis 
                        type="number"
                        stroke="#888888" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="category"
                        type="category"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="score" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Trends Over Time</CardTitle>
                <CardDescription>Interview volume and completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ChartContainer
                    config={{
                      interviews: { color: "hsl(var(--primary))" },
                      completionRate: { color: "#00C49F" },
                    }}
                    className="aspect-[4/3]"
                  >
                    <LineChart data={trendData}>
                      <XAxis 
                        dataKey="month" 
                        stroke="#888888" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="interviews" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completionRate" 
                        stroke="#00C49F" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-Generated analysis of platform data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3 pb-4 border-b">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Data-Driven Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        {trendData.length > 0 
                          ? `Interview completion rates have shown trends over time with ${trendData.length} months of data analyzed.`
                          : 'No trend data available for analysis.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pb-4 border-b">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Performance Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {performanceData.length > 0 
                          ? `Average performance scores across ${performanceData.length} categories show varied results.`
                          : 'No performance data available for analysis.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pb-4 border-b">
                    <BarChart2 className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Distribution Patterns</h4>
                      <p className="text-sm text-muted-foreground">
                        {institutionData.length > 0 
                          ? `Platform usage is distributed across ${institutionData.length} institutions.`
                          : 'No institution distribution data available.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Target className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Opportunity Areas</h4>
                      <p className="text-sm text-muted-foreground">
                        {skillGapsData.length > 0 
                          ? `Top skill gaps identified across ${skillGapsData.length} key areas.`
                          : 'No skill gap data available for analysis.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="skills" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-6'}`}>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Top Skill Gaps Across Platform</CardTitle>
                <CardDescription>Areas where students are struggling the most</CardDescription>
              </CardHeader>
              <CardContent>
                {skillGapsData.length > 0 ? (
                  <ChartContainer
                    config={{
                      gap: { color: "hsl(var(--destructive))" },
                    }}
                    className="aspect-[16/9]"
                  >
                    <BarChart data={skillGapsData}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="gap" 
                        fill="hsl(var(--destructive))" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No skill gap data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommended Focus Areas</CardTitle>
                <CardDescription>AI-suggested areas for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-red-100 p-2 rounded-md">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Technical Interview Preparation</h4>
                      <p className="text-sm text-muted-foreground">
                        {skillGapsData.length > 0 
                          ? `Focus on areas with highest skill gaps like ${skillGapsData.slice(0, 2).map(s => s.name).join(' and ')}.`
                          : 'No specific recommendations available.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-yellow-100 p-2 rounded-md">
                      <BookOpen className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Behavioral Question Workshops</h4>
                      <p className="text-sm text-muted-foreground">
                        {skillGapsData.length > 1 
                          ? `Address behavioral skill gaps identified in ${skillGapsData[1]?.name || 'key areas'}.`
                          : 'No behavioral skill gap data available.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-md">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Targeted Intervention</h4>
                      <p className="text-sm text-muted-foreground">
                        {skillGapsData.length > 0 
                          ? `Prioritize interventions for the top ${Math.min(3, skillGapsData.length)} skill gaps.`
                          : 'No targeted intervention data available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>Analysis of skill gaps from anonymous user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillGapsData.length > 0 ? (
                    skillGapsData.map((skillGap, index) => (
                      <div key={index} className={index < skillGapsData.length - 1 ? "pb-4 border-b" : ""}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skillGap.name}</span>
                          <span className="text-sm font-medium">{skillGap.gap}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGap.gap}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No skill gap data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="institutions" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>Overall platform usage distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-2">Data from anonymous users</p>
                    <p className="text-sm text-muted-foreground">
                      {interviewAnalysesCount > 0 
                        ? `${interviewAnalysesCount} interview ${interviewAnalysesCount === 1 ? 'analysis' : 'analyses'} collected today` 
                        : 'No interview analyses available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Average scores across platform</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                        <span>Anonymous Users</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-blue-500" 
                            style={{ 
                              width: `${Math.round(performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length)}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Performance by Category</h4>
                      <div className="space-y-2">
                        {performanceData.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.category}</span>
                            <span>{item.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Insights</CardTitle>
                <CardDescription>AI-Generated recommendations from anonymous user data</CardDescription>
              </CardHeader>
              <CardContent>
                {skillGapsData.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Skill Gaps Identified</h4>
                      <div className="space-y-3">
                        {skillGapsData.slice(0, 3).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{skill.name}</span>
                            <span className="text-sm font-medium text-red-500">{skill.gap}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Based on {interviewAnalysesCount} interview {interviewAnalysesCount === 1 ? 'analysis' : 'analyses'} from anonymous users. 
                        Focus on addressing these skill gaps to improve overall performance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-2">Insights based on anonymous interview data</p>
                      <p className="text-sm text-muted-foreground">Focus on addressing skill gaps to improve overall performance</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Platform Insights</CardTitle>
              <CardDescription>Comprehensive performance assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Overall Performance Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-center">
                        <span className={
                          aiInsights.overallPerformanceGrade === 'A' || aiInsights.overallPerformanceGrade === 'A-' || aiInsights.overallPerformanceGrade === 'A+' ? 'text-green-600' :
                          aiInsights.overallPerformanceGrade === 'B' || aiInsights.overallPerformanceGrade === 'B-' || aiInsights.overallPerformanceGrade === 'B+' ? 'text-green-500' :
                          aiInsights.overallPerformanceGrade === 'C' || aiInsights.overallPerformanceGrade === 'C-' || aiInsights.overallPerformanceGrade === 'C+' ? 'text-yellow-500' :
                          aiInsights.overallPerformanceGrade === 'D' || aiInsights.overallPerformanceGrade === 'D-' || aiInsights.overallPerformanceGrade === 'D+' ? 'text-orange-500' :
                          aiInsights.overallPerformanceGrade === 'F' ? 'text-red-500' : 'text-gray-500'
                        }>
                          {aiInsights.overallPerformanceGrade || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-center text-muted-foreground mt-1">
                        Overall Performance Grade
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-center">
                        {aiInsights.dataLinkingStatus || 'Unknown data linking status'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Grade Explanation</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      {aiInsights.gradeExplanation || 'No grade explanation available.'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Student Improvement Assessment</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      {aiInsights.studentImprovementAssessment || 'No student improvement assessment available.'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Insight</h3>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      {aiInsights.keyInsight || 'No key insight available.'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Platform Administrator Note</h4>
                  </div>
                  <p className="text-sm">
                    This assessment is based on aggregate data from 2 interview analyses. The collected data is not currently linked to specific institutional identifiers or individual student metadata. All analysis is based solely on two anonymous, aggregated reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalytics;
