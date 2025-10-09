import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { interviewService } from '@/services/interview.service';
import { 
  MessageSquare, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Calendar,
  Clock,
  Users
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

interface StudentStats {
  id: string;
  name: string;
  interviewCount: number;
  averageScore: number;
  improvementRate: number;
  lastInterviewDate?: Date;
}

const DepartmentAnalyticsDashboard = ({ 
  departmentId,
  institutionId
}: { 
  departmentId: string;
  institutionId: string;
}) => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for this department
        const data = await interviewService.getDepartmentAnalyses(departmentId, institutionId);
        setAnalyses(data);
        
        // For demo purposes, use mock data
        if (data.length === 0) {
          const mockData: AnalysisData[] = [
            {
              id: '1',
              callId: 'call-001',
              summary: 'The candidate demonstrated strong communication skills and technical knowledge.',
              structuredData: {},
              successEvaluation: {},
              transcript: 'Sample transcript...',
              recordingUrl: '',
              duration: 900,
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              studentId: 'student-001',
              departmentId: departmentId,
              institutionId: institutionId,
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
              studentId: 'student-002',
              departmentId: departmentId,
              institutionId: institutionId,
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
              studentId: 'student-003',
              departmentId: departmentId,
              institutionId: institutionId,
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
          
          const mockStudentStats: StudentStats[] = [
            { id: 'student-001', name: 'Alice Johnson', interviewCount: 5, averageScore: 85, improvementRate: 12, lastInterviewDate: new Date(Date.now() - 86400000) },
            { id: 'student-002', name: 'Bob Smith', interviewCount: 3, averageScore: 78, improvementRate: 8, lastInterviewDate: new Date(Date.now() - 172800000) },
            { id: 'student-003', name: 'Carol Davis', interviewCount: 4, averageScore: 92, improvementRate: 15, lastInterviewDate: new Date(Date.now() - 259200000) },
            { id: 'student-004', name: 'David Wilson', interviewCount: 2, averageScore: 76, improvementRate: 5, lastInterviewDate: new Date(Date.now() - 345600000) }
          ];
          
          setAnalyses(mockData);
          setStudentStats(mockStudentStats);
        }
      } catch (err) {
        setError('Failed to load analysis data');
        console.error('Error fetching analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [departmentId, institutionId]);

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

  const topStudentsData = studentStats
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)
    .map(student => ({
      name: student.name,
      score: student.averageScore
    }));

  // Calculate department metrics
  const totalInterviews = analyses.length;
  const averageScore = analyses.length > 0 
    ? (analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length).toFixed(1)
    : '0.0';
  const totalStudents = studentStats.length;
  const improvingStudents = studentStats.filter(s => s.improvementRate > 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">+2.3 points from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-muted-foreground" />
              Improving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{improvingStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students showing progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Interview scores over time</CardDescription>
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
        
        {/* Top Performing Students */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
            <CardDescription>Highest average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStudentsData}>
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

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Detailed statistics for department students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Interviews</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">Improvement</th>
                  <th className="text-left py-2">Last Interview</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">{student.name}</td>
                    <td className="py-3">{student.interviewCount}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <span className="font-medium">{student.averageScore}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <TrendingUp className={`h-4 w-4 mr-1 ${student.improvementRate > 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={student.improvementRate > 0 ? 'text-green-500' : 'text-red-500'}>
                          {student.improvementRate > 0 ? '+' : ''}{student.improvementRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {student.lastInterviewDate ? formatDate(student.lastInterviewDate) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>Latest end-of-call analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">
                        {studentStats.find(s => s.id === analysis.studentId)?.name || analysis.studentId}
                      </h3>
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

export default DepartmentAnalyticsDashboard;