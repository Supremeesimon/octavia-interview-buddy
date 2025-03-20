
import React, { useState } from 'react';
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

// Mock data for performance metrics
const performanceData = [
  { category: 'Communication', score: 85 },
  { category: 'Technical Knowledge', score: 72 },
  { category: 'Problem Solving', score: 90 },
  { category: 'Creativity', score: 65 },
  { category: 'Cultural Fit', score: 88 },
];

// Mock data for trends
const trendData = [
  { month: 'Jan', interviews: 210, completionRate: 68 },
  { month: 'Feb', interviews: 280, completionRate: 72 },
  { month: 'Mar', interviews: 350, completionRate: 75 },
  { month: 'Apr', interviews: 410, completionRate: 82 },
  { month: 'May', interviews: 520, completionRate: 88 },
];

// Mock data for institution breakdown
const institutionData = [
  { name: 'Harvard University', value: 35 },
  { name: 'Stanford University', value: 25 },
  { name: 'MIT', value: 20 },
  { name: 'Yale University', value: 15 },
  { name: 'Princeton University', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for skill gaps
const skillGapsData = [
  { name: 'Technical Interviews', gap: 42 },
  { name: 'Behavioral Questions', gap: 28 },
  { name: 'Problem Solving', gap: 15 },
  { name: 'Communication', gap: 10 },
  { name: 'Cultural Fit', gap: 5 },
];

const AIAnalytics = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  
  const renderPieChart = () => {
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Trends Over Time</CardTitle>
                <CardDescription>Interview volume and completion rate</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <h4 className="font-medium">Increasing Engagement</h4>
                      <p className="text-sm text-muted-foreground">Interview completion rates have increased by 29% over the past quarter, suggesting improved student engagement with the platform.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pb-4 border-b">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Session Duration Patterns</h4>
                      <p className="text-sm text-muted-foreground">Average session times peak on Wednesday mornings (18.5 min), while weekend usage shows shorter sessions (12.3 min) but higher completion rates.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pb-4 border-b">
                    <BarChart2 className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Performance Distribution</h4>
                      <p className="text-sm text-muted-foreground">65% of users score between 70-85% on their interviews, with technical knowledge showing the widest performance variance across institutions.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Target className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Common Challenge Areas</h4>
                      <p className="text-sm text-muted-foreground">Behavioral questions around conflict resolution and technical questions on system design emerge as the most challenging areas for students.</p>
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
                      <p className="text-sm text-muted-foreground">Develop more resources for system design and algorithmic problem-solving.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-yellow-100 p-2 rounded-md">
                      <BookOpen className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Behavioral Question Workshops</h4>
                      <p className="text-sm text-muted-foreground">Create focused content on answering conflict resolution scenarios.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-md">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Targeted Intervention</h4>
                      <p className="text-sm text-muted-foreground">Deploy specialized modules for the 15% of users scoring below 60%.</p>
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
                          <span className="text-sm font-medium">72%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Leadership Questions</span>
                          <span className="text-sm font-medium">58%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '58%' }}></div>
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
                          <span className="text-sm font-medium">81%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '81%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Problem Solving</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }}></div>
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
                          <span className="text-sm font-medium">76%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '76%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Data Analysis</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '62%' }}></div>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-2"></div>
                      <span>Harvard University</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#0088FE] rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-2"></div>
                      <span>Stanford University</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#00C49F] rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-2"></div>
                      <span>MIT</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#FFBB28] rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF8042] mr-2"></div>
                      <span>Yale University</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#FF8042] rounded-full" style={{ width: '84%' }}></div>
                      </div>
                      <span className="text-sm font-medium">84%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#8884D8] mr-2"></div>
                      <span>Princeton University</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-[#8884D8] rounded-full" style={{ width: '86%' }}></div>
                      </div>
                      <span className="text-sm font-medium">86%</span>
                    </div>
                  </div>
                </div>
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
                <div className="space-y-5">
                  <div className="pb-4 border-b">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-2"></div>
                      <h4 className="font-medium">Harvard University</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Students excel in behavioral interviews but struggle with technical problem-solving. Recommended to implement additional technical workshops focusing on algorithmic thinking.</p>
                  </div>
                  
                  <div className="pb-4 border-b">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-2"></div>
                      <h4 className="font-medium">Stanford University</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">High technical proficiency with room for improvement in communication skills. Consider adding more mock interviews focused on explaining complex concepts simply.</p>
                  </div>
                  
                  <div className="pb-4 border-b">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-2"></div>
                      <h4 className="font-medium">MIT</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Students demonstrate strong analytical abilities but could improve on teamwork scenarios. Recommend adding collaborative interview practice sessions.</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF8042] mr-2"></div>
                      <h4 className="font-medium">Yale University</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Strong communication skills with opportunities to enhance technical depth. Consider specialized technical interview preparation for non-STEM majors.</p>
                  </div>
                </div>
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
                  Analysis of 24,589 interviews conducted across 5 major institutions reveals several key patterns and opportunities for platform enhancement. Overall engagement metrics show positive growth with a 29% increase in session completion rates quarter-over-quarter.
                </p>
                
                <h3 className="text-lg font-semibold">Key Observations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li><strong>Usage Patterns:</strong> Peak platform usage occurs Tuesday-Thursday, with highest engagement between 6-9pm local time.</li>
                  <li><strong>Performance Trends:</strong> Average student scores have increased 8.7% since implementing AI feedback mechanisms.</li>
                  <li><strong>Engagement Correlation:</strong> Students who complete more than 3 practice interviews show a 42% higher success rate in securing roles.</li>
                  <li><strong>Institutional Variations:</strong> Technical universities show different skill gap patterns compared to liberal arts colleges.</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li><strong>Tailored Content:</strong> Develop institution-specific resources based on identified skill gaps.</li>
                  <li><strong>Engagement Strategy:</strong> Implement targeted messaging for users who haven't completed interviews in 14+ days.</li>
                  <li><strong>Feature Development:</strong> Prioritize group interview simulation features based on demand analysis.</li>
                  <li><strong>Resource Allocation:</strong> Focus on technical interview preparation resources, which show highest demand across all institutions.</li>
                </ol>
                
                <h3 className="text-lg font-semibold">Forecasted Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Implementing these recommendations is projected to increase user engagement by 15-20% and improve overall interview performance scores by 10-12% within two quarters.
                </p>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">AI-Powered Next Steps</h4>
                  </div>
                  <p className="text-sm">
                    Based on current platform data, the system recommends focusing on developing specialized technical interview preparation content, implementing student engagement reminders, and creating institution-specific skill development resources.
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
