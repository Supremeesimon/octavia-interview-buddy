import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { interviewService } from '@/services/interview.service';
import { 
  MessageSquare, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

interface AnalysisData {
  id: string;
  callId: string;
  summary: string;
  structuredData: any;
  successEvaluation: any;
  transcript: string;
  recordingUrl: string;
  duration: number;
  timestamp: Date;
  studentId: string;
  departmentId: string;
  institutionId: string;
  interviewType: string;
  overallScore: number;
  categories: any[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

const StudentAnalyticsDashboard = ({ studentId }: { studentId: string }) => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for this student
        const data = await interviewService.getStudentAnalyses(studentId);
        setAnalyses(data);
        
        // For demo purposes, use mock data
        if (data.length === 0) {
          const mockData: AnalysisData[] = [
            {
              id: '1',
              callId: 'call-001',
              summary: 'You demonstrated strong communication skills and technical knowledge.',
              structuredData: {},
              successEvaluation: {},
              transcript: 'Sample transcript...',
              recordingUrl: '',
              duration: 900,
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              studentId: studentId,
              departmentId: 'dept-cs',
              institutionId: 'inst-1',
              interviewType: 'technical',
              overallScore: 85,
              categories: [
                { name: 'Communication', score: 90 },
                { name: 'Technical Knowledge', score: 80 },
                { name: 'Problem Solving', score: 85 }
              ],
              strengths: ['Clear communication', 'Strong technical foundation'],
              improvements: ['Provide more specific examples', 'Speak more confidently'],
              recommendations: ['Practice with the STAR method', 'Review technical concepts']
            },
            {
              id: '2',
              callId: 'call-002',
              summary: 'Good performance with room for improvement in technical areas.',
              structuredData: {},
              successEvaluation: {},
              transcript: 'Sample transcript...',
              recordingUrl: '',
              duration: 720,
              timestamp: new Date(Date.now() - 172800000), // 2 days ago
              studentId: studentId,
              departmentId: 'dept-cs',
              institutionId: 'inst-1',
              interviewType: 'behavioral',
              overallScore: 78,
              categories: [
                { name: 'Communication', score: 82 },
                { name: 'Technical Knowledge', score: 75 },
                { name: 'Problem Solving', score: 77 }
              ],
              strengths: ['Good communication', 'Logical thinking'],
              improvements: ['Technical depth', 'Confidence'],
              recommendations: ['Study technical fundamentals', 'Practice mock interviews']
            },
            {
              id: '3',
              callId: 'call-003',
              summary: 'Excellent improvement from previous interview. Strong technical skills.',
              structuredData: {},
              successEvaluation: {},
              transcript: 'Sample transcript...',
              recordingUrl: '',
              duration: 840,
              timestamp: new Date(Date.now() - 259200000), // 3 days ago
              studentId: studentId,
              departmentId: 'dept-cs',
              institutionId: 'inst-1',
              interviewType: 'technical',
              overallScore: 92,
              categories: [
                { name: 'Communication', score: 95 },
                { name: 'Technical Knowledge', score: 90 },
                { name: 'Problem Solving', score: 91 }
              ],
              strengths: ['Excellent communication', 'Deep technical knowledge', 'Creative problem solving'],
              improvements: ['Could provide more context in some answers'],
              recommendations: ['Continue practicing with varied question types', 'Maintain current excellent performance']
            }
          ];
          
          setAnalyses(mockData);
        }
      } catch (err) {
        setError('Failed to load analysis data');
        console.error('Error fetching analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAnalysisData();
    }
  }, [studentId]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const performanceTrendData = analyses
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((analysis, index) => ({
      interview: `Interview ${index + 1}`,
      score: analysis.overallScore,
      date: formatDate(new Date(analysis.timestamp))
    }));

  const categoryPerformanceData = analyses.length > 0 
    ? analyses[analyses.length - 1].categories.map(category => ({
        name: category.name,
        score: category.score
      }))
    : [];

  // Calculate improvement
  const firstScore = analyses.length > 0 ? analyses[0].overallScore : 0;
  const latestScore = analyses.length > 0 ? analyses[analyses.length - 1].overallScore : 0;
  const improvement = latestScore - firstScore;

  // Get top strengths and improvements
  const allStrengths = analyses.flatMap(a => a.strengths);
  const allImprovements = analyses.flatMap(a => a.improvements);
  
  // Count occurrences of each strength/improvement
  const strengthCounts = allStrengths.reduce((acc, strength) => {
    acc[strength] = (acc[strength] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const improvementCounts = allImprovements.reduce((acc, improvement) => {
    acc[improvement] = (acc[improvement] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top 3 strengths and improvements
  const topStrengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([strength]) => strength);
    
  const topImprovements = Object.entries(improvementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([improvement]) => improvement);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground">Keep practicing!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
              Current Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestScore}</div>
            <div className="flex items-center text-xs">
              <span className={improvement >= 0 ? "text-green-500" : "text-red-500"}>
                {improvement >= 0 ? '↑' : '↓'} {Math.abs(improvement)} points
              </span>
              <span className="text-muted-foreground ml-1">from first interview</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-muted-foreground" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="flex items-center">
              <Progress value={85} className="h-2 w-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Toward target score of 90</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="interview" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Breakdown of your performance by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Your Strengths</CardTitle>
            <CardDescription>Areas where you excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStrengths.map((strength, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">Focus Areas</CardTitle>
            <CardDescription>Skills to work on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topImprovements.map((improvement, index) => (
                <div key={index} className="flex items-center p-3 bg-amber-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium">{improvement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Feedback</CardTitle>
          <CardDescription>Detailed analysis from your recent interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">Interview #{analyses.indexOf(analysis) + 1}</h3>
                      <Badge variant="secondary">{analysis.interviewType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{analysis.overallScore}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
                
                {/* Category Scores */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Category Scores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {analysis.categories.map((category, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{category.score}</span>
                        </div>
                        <Progress value={category.score} className="h-1.5 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-600">Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-amber-600">Areas for Improvement</h4>
                    <ul className="text-sm space-y-1">
                      {analysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(analysis.duration / 60)}m {analysis.duration % 60}s
                  </span>
                  <span>{formatDate(new Date(analysis.timestamp))}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalyticsDashboard;