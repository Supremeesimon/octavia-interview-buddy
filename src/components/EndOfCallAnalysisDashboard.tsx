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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { interviewService } from '@/services/interview.service';
import { 
  MessageSquare, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Calendar,
  Clock,
  Users,
  Building,
  GraduationCap
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

interface DepartmentStats {
  id: string;
  name: string;
  studentCount: number;
  averageScore: number;
  totalInterviews: number;
}

interface InstitutionStats {
  id: string;
  name: string;
  departmentCount: number;
  studentCount: number;
  averageScore: number;
  totalInterviews: number;
}

const EndOfCallAnalysisDashboard = ({ 
  institutionId, 
  departmentId,
  userRole 
}: { 
  institutionId: string;
  departmentId?: string;
  userRole: 'platform_admin' | 'institution_admin' | 'department_head' | 'student';
}) => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [institutionStats, setInstitutionStats] = useState<InstitutionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on user role and hierarchy level
        let data: AnalysisData[] = [];
        
        if (userRole === 'platform_admin') {
          // Platform admin can see all data
          data = await interviewService.getAllAnalyses(100);
        } else if (userRole === 'institution_admin') {
          // Institution admin can see data for their institution
          data = await interviewService.getInstitutionAnalyses(institutionId);
        } else if (userRole === 'department_head' && departmentId) {
          // Department head can see data for their department
          data = await interviewService.getDepartmentAnalyses(departmentId, institutionId);
        } else if (userRole === 'student') {
          // Students can only see their own data
          // We would need to get the student ID from context
          data = []; // Empty for now
        }
        
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
              departmentId: 'dept-cs',
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
              departmentId: 'dept-ee',
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
            }
          ];
          
          const mockDepartmentStats: DepartmentStats[] = [
            { id: 'dept-cs', name: 'Computer Science', studentCount: 120, averageScore: 84, totalInterviews: 240 },
            { id: 'dept-ee', name: 'Electrical Engineering', studentCount: 95, averageScore: 78, totalInterviews: 190 },
            { id: 'dept-me', name: 'Mechanical Engineering', studentCount: 105, averageScore: 82, totalInterviews: 210 },
            { id: 'dept-ce', name: 'Civil Engineering', studentCount: 85, averageScore: 79, totalInterviews: 170 }
          ];
          
          const mockInstitutionStats: InstitutionStats[] = [
            { id: 'inst-1', name: 'Harvard University', departmentCount: 12, studentCount: 1250, averageScore: 82, totalInterviews: 3450 },
            { id: 'inst-2', name: 'MIT', departmentCount: 8, studentCount: 850, averageScore: 79, totalInterviews: 2100 },
            { id: 'inst-3', name: 'Stanford', departmentCount: 10, studentCount: 650, averageScore: 85, totalInterviews: 1850 }
          ];
          
          setAnalyses(mockData);
          setDepartmentStats(mockDepartmentStats);
          setInstitutionStats(mockInstitutionStats);
        }
      } catch (err) {
        setError('Failed to load analysis data');
        console.error('Error fetching analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [institutionId, departmentId, userRole]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
  const scoreDistributionData = analyses.reduce((acc, analysis) => {
    const scoreRange = Math.floor(analysis.overallScore / 10) * 10;
    const rangeLabel = `${scoreRange}-${scoreRange + 9}`;
    acc[rangeLabel] = (acc[rangeLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scoreDistributionChartData = Object.entries(scoreDistributionData).map(([range, count]) => ({
    range,
    count
  }));

  const departmentPerformanceData = departmentStats.map(dept => ({
    name: dept.name,
    averageScore: dept.averageScore,
    interviews: dept.totalInterviews
  }));

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
            <div className="text-2xl font-bold">{analyses.length}</div>
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
            <div className="text-2xl font-bold">
              {analyses.length > 0 
                ? (analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">+2.3 points from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              {userRole === 'platform_admin' ? 'Institutions' : 'Departments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRole === 'platform_admin' 
                ? institutionStats.length 
                : departmentStats.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'platform_admin' 
                ? 'Total institutions' 
                : 'Active departments'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              {userRole === 'platform_admin' || userRole === 'institution_admin' ? 'Students' : 'Interviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRole === 'platform_admin' || userRole === 'institution_admin' 
                ? departmentStats.reduce((sum, dept) => sum + dept.studentCount, 0)
                : analyses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'platform_admin' || userRole === 'institution_admin' 
                ? 'Total students' 
                : 'This week'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of interview scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Department/Institution Performance */}
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'platform_admin' ? 'Institution' : 'Department'} Performance
            </CardTitle>
            <CardDescription>
              Average scores by {userRole === 'platform_admin' ? 'institution' : 'department'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRole === 'platform_admin' ? institutionStats : departmentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>Latest end-of-call analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">
                        {departmentStats.find(d => d.id === analysis.departmentId)?.name || analysis.departmentId}
                      </h3>
                      <Badge variant="secondary">{analysis.interviewType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{analysis.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(analysis.duration / 60)}m {analysis.duration % 60}s
                      </span>
                      <span>{formatDate(new Date(analysis.timestamp))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{analysis.overallScore}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
                
                {/* Category Scores */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs">{category.name}:</span>
                      <Badge variant="outline">{category.score}</Badge>
                    </div>
                  ))}
                </div>
                
                {/* Strengths and Improvements */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Strengths</h4>
                    <ul className="text-xs space-y-1">
                      {analysis.strengths.slice(0, 2).map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Areas for Improvement</h4>
                    <ul className="text-xs space-y-1">
                      {analysis.improvements.slice(0, 2).map((improvement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-amber-500 mr-1">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndOfCallAnalysisDashboard;