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
  Building, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';

interface InstitutionStats {
  id: string;
  name: string;
  departmentCount: number;
  studentCount: number;
  averageScore: number;
  totalInterviews: number;
  activeUsers: number;
  licenseUtilization: number;
}

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

const PlatformAnalyticsDashboard = () => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [institutionStats, setInstitutionStats] = useState<InstitutionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for all institutions (platform admin view)
        const data = await interviewService.getAllAnalyses(100);
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
              studentId: 'student-002',
              departmentId: 'dept-ee',
              institutionId: 'inst-2',
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
          
          const mockInstitutionStats: InstitutionStats[] = [
            { id: 'inst-1', name: 'Harvard University', departmentCount: 12, studentCount: 1250, averageScore: 82, totalInterviews: 3450, activeUsers: 980, licenseUtilization: 78 },
            { id: 'inst-2', name: 'MIT', departmentCount: 8, studentCount: 850, averageScore: 79, totalInterviews: 2100, activeUsers: 720, licenseUtilization: 85 },
            { id: 'inst-3', name: 'Stanford', departmentCount: 10, studentCount: 650, averageScore: 85, totalInterviews: 1850, activeUsers: 590, licenseUtilization: 90 },
            { id: 'inst-4', name: 'Berkeley', departmentCount: 9, studentCount: 780, averageScore: 77, totalInterviews: 1200, activeUsers: 520, licenseUtilization: 67 }
          ];
          
          setAnalyses(mockData);
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
  }, []);

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

  const institutionPerformanceData = institutionStats.map(inst => ({
    name: inst.name,
    averageScore: inst.averageScore,
    interviews: inst.totalInterviews
  }));

  // Calculate platform metrics
  const totalInstitutions = institutionStats.length;
  const totalStudents = institutionStats.reduce((sum, inst) => sum + inst.studentCount, 0);
  const totalInterviews = institutionStats.reduce((sum, inst) => sum + inst.totalInterviews, 0);
  const avgPlatformScore = institutionStats.length > 0 
    ? (institutionStats.reduce((sum, inst) => sum + inst.averageScore, 0) / institutionStats.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstitutions}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
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
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
              Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Conducted this month</p>
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
            <div className="text-2xl font-bold">{avgPlatformScore}</div>
            <p className="text-xs text-muted-foreground">Platform-wide average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institution Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Performance</CardTitle>
            <CardDescription>Average scores by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={institutionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* License Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>License Utilization</CardTitle>
            <CardDescription>Usage across institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={institutionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="licenseUtilization"
                  nameKey="name"
                  label={({ name, licenseUtilization }) => `${name}: ${licenseUtilization}%`}
                >
                  {institutionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Institution Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Institution Leaderboard</CardTitle>
          <CardDescription>Performance ranking across all institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Institution</th>
                  <th className="text-left py-2">Departments</th>
                  <th className="text-left py-2">Students</th>
                  <th className="text-left py-2">Interviews</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">License Use</th>
                </tr>
              </thead>
              <tbody>
                {institutionStats
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map((inst, index) => (
                    <tr key={inst.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center">
                          <span className="font-medium">{inst.name}</span>
                          {index === 0 && (
                            <Badge className="ml-2" variant="default">Top</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">{inst.departmentCount}</td>
                      <td className="py-3">{inst.studentCount.toLocaleString()}</td>
                      <td className="py-3">{inst.totalInterviews.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <span className="font-medium">{inst.averageScore}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Progress value={inst.licenseUtilization} className="h-2 w-24 mr-2" />
                          <span>{inst.licenseUtilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interviews across all institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">
                        {institutionStats.find(i => i.id === analysis.institutionId)?.name || analysis.institutionId}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalyticsDashboard;