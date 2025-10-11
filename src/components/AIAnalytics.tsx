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

const AIAnalytics = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [institutionData, setInstitutionData] = useState<any[]>([]);
  const [institutionPerformanceData, setInstitutionPerformanceData] = useState<any[]>([]);
  const [skillGapsData, setSkillGapsData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
        
        console.log('Fetched data:', { perfData, trendData, instData, instPerfData, gapsData });
        
        setPerformanceData(perfData);
        setTrendData(trendData);
        setInstitutionData(instData);
        setInstitutionPerformanceData(instPerfData);
        setSkillGapsData(gapsData);
        
        // Generate AI insights
        console.log('Generating AI insights...');
        const insightsData = {
          performanceData: perfData,
          trendData: trendData,
          institutionData: instData,
          skillGapsData: gapsData
        };
        console.log('Insights data:', JSON.stringify(insightsData, null, 2));
        const insights = await aiAnalyticsService.generateAIInsights(insightsData);
        console.log('Generated insights:', insights);
        setAiInsights(insights);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
            Institutions
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
                <CardTitle>Skill Gap Analysis by Institution Type</CardTitle>
                <CardDescription>Comparison of different educational institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="pb-4 border-b">
                    <h4 className="font-medium mb-2">Technical Universities</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Soft Skills & Communication</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 0 ? `${Math.min(100, Math.round(skillGapsData[0]?.gap * 0.8))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 0 ? Math.min(100, Math.round(skillGapsData[0]?.gap * 0.8)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Leadership Questions</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 1 ? `${Math.min(100, Math.round(skillGapsData[1]?.gap * 0.7))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 1 ? Math.min(100, Math.round(skillGapsData[1]?.gap * 0.7)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pb-4 border-b">
                    <h4 className="font-medium mb-2">Liberal Arts Colleges</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Technical Knowledge</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 2 ? `${Math.min(100, Math.round(skillGapsData[2]?.gap * 0.9))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 2 ? Math.min(100, Math.round(skillGapsData[2]?.gap * 0.9)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Problem Solving</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 3 ? `${Math.min(100, Math.round(skillGapsData[3]?.gap * 0.75))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 3 ? Math.min(100, Math.round(skillGapsData[3]?.gap * 0.75)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Business Schools</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Technical Implementation</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 0 ? `${Math.min(100, Math.round(skillGapsData[0]?.gap * 0.76))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 0 ? Math.min(100, Math.round(skillGapsData[0]?.gap * 0.76)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Data Analysis</span>
                          <span className="text-sm font-medium">
                            {skillGapsData.length > 4 ? `${Math.min(100, Math.round(skillGapsData[4]?.gap * 0.62))}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${skillGapsData.length > 4 ? Math.min(100, Math.round(skillGapsData[4]?.gap * 0.62)) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="institutions" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
                <CardDescription>Platform usage by institution</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPieChart()}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Institution Performance</CardTitle>
                <CardDescription>Average student scores by institution</CardDescription>
              </CardHeader>
              <CardContent>
                {institutionPerformanceData.length > 0 ? (
                  <div className="space-y-4">
                    {institutionPerformanceData.map((inst, index) => (
                      <div key={inst.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{inst.name}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${inst.score}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{inst.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No institution performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Institution-Specific Insights</CardTitle>
                <CardDescription>AI-Generated recommendations for each institution</CardDescription>
              </CardHeader>
              <CardContent>
                {institutionData.length > 0 ? (
                  <div className="space-y-5">
                    {institutionData.map((inst, index) => (
                      <div 
                        key={inst.name} 
                        className={index < institutionData.length - 1 ? "pb-4 border-b" : ""}
                      >
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <h4 className="font-medium">{inst.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {skillGapsData.length > 0 
                            ? `Focus on addressing skill gaps in ${skillGapsData.slice(0, 2).map(s => s.name).join(' and ')} to improve overall performance.`
                            : 'No specific recommendations available at this time.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No institution-specific insights available</p>
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
              <CardDescription>Comprehensive analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold">Executive Summary</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {aiInsights || 'No insights generated at this time. Please check back later.'}
                </p>
                
                <h3 className="text-lg font-semibold">Key Observations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  {aiInsights ? (
                    // If we have AI insights, try to parse them or show a generic message
                    <li className="text-sm text-muted-foreground">
                      {aiInsights.includes('Key Observations') 
                        ? 'See detailed insights above' 
                        : 'AI-generated observations are included in the executive summary above'}
                    </li>
                  ) : (
                    // If no AI insights, show mock data
                    <>
                      <li><strong>Usage Patterns:</strong> Platform usage varies by time and institution.</li>
                      <li><strong>Performance Trends:</strong> Average scores show variation across categories.</li>
                      <li><strong>Engagement Correlation:</strong> Active users show different patterns than inactive ones.</li>
                      <li><strong>Institutional Variations:</strong> Different institutions show different performance patterns.</li>
                    </>
                  )}
                </ul>
                
                <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                  {aiInsights ? (
                    // If we have AI insights, try to parse them or show a generic message
                    <li className="text-sm text-muted-foreground">
                      {aiInsights.includes('Recommendations') 
                        ? 'See detailed recommendations above' 
                        : 'AI-generated recommendations are included in the executive summary above'}
                    </li>
                  ) : (
                    // If no AI insights, show mock data
                    <>
                      <li><strong>Tailored Content:</strong> Develop institution-specific resources based on identified skill gaps.</li>
                      <li><strong>Engagement Strategy:</strong> Implement targeted messaging for users with specific needs.</li>
                      <li><strong>Feature Development:</strong> Prioritize features based on demand analysis.</li>
                      <li><strong>Resource Allocation:</strong> Focus on areas showing highest demand across institutions.</li>
                    </>
                  )}
                </ol>
                
                <h3 className="text-lg font-semibold">Forecasted Impact</h3>
                <p className="text-sm text-muted-foreground">
                  {aiInsights 
                    ? (aiInsights.includes('Forecasted Impact') 
                        ? 'See detailed forecast above' 
                        : 'AI-generated forecast is included in the executive summary above')
                    : 'Implementing these recommendations is projected to improve user engagement and performance scores based on current data trends.'}
                </p>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">AI-Powered Next Steps</h4>
                  </div>
                  <p className="text-sm">
                    Based on current platform data, the system recommends focusing on skill gap areas, implementing targeted engagement strategies, and creating institution-specific resources.
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