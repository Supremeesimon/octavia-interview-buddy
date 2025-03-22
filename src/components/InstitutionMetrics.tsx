
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, PieChart, LineChart, Users, Brain, Clock, FileText, 
  Gauge, Award, Briefcase, BookOpen, Trophy, Calendar, PersonStanding
} from 'lucide-react';

const InstitutionMetrics = () => {
  // Group metrics by category for better organization
  const metricCategories = [
    {
      id: 'performance',
      name: 'Student Performance',
      icon: <Gauge className="h-5 w-5 text-primary" />,
      metrics: [
        'Average Interview Score',
        'Response Quality Rating',
        'Question Comprehension Rate',
        'Communication Clarity Index',
        'Technical Knowledge Assessment',
        'Problem-Solving Effectiveness',
        'Self-Presentation Score',
        'Interview Completion Rate',
        'Improvement Trajectory',
        'Competency Gap Analysis'
      ]
    },
    {
      id: 'engagement',
      name: 'Student Engagement',
      icon: <Users className="h-5 w-5 text-primary" />,
      metrics: [
        'Active Student Count',
        'Practice Session Frequency',
        'Average Session Duration',
        'Return Rate',
        'Feature Utilization',
        'Feedback Implementation',
        'Resource Access Rate',
        'Peer Comparison Engagement',
        'Career Resource Utilization',
        'Community Participation'
      ]
    },
    {
      id: 'outcomes',
      name: 'Career Outcomes',
      icon: <Briefcase className="h-5 w-5 text-primary" />,
      metrics: [
        'Job Application Conversion',
        'Interview Invitation Rate',
        'Offer Acceptance Percentage',
        'Salary Negotiation Success',
        'Career Path Alignment',
        'Industry Placement Distribution',
        'Employer Satisfaction Rating',
        'Graduate Employment Rate',
        'Retention in First Position',
        'Career Advancement Velocity'
      ]
    }
  ];

  return (
    <section className="py-16 bg-muted/30" id="institution-metrics">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">30 Actionable Metrics for Institutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gain unprecedented insight into student interview performance and career readiness with our comprehensive analytics platform.
          </p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-1 md:grid-cols-3">
              {metricCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
                  tooltip={`View ${category.name.toLowerCase()} metrics`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {metricCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.metrics.map((metric, index) => (
                  <Card key={index} className="border-2 border-primary/5 hover:border-primary/20 transition-colors duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getMetricIcon(index)}
                        <span>{metric}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {getMetricDescription(metric)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 bg-primary/10 rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Transform Data into Student Success</h3>
              <p className="mb-4">
                Our metrics don't just provide numbers—they deliver actionable insights that help your institution:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Identify skill gaps across your student population</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Measure impact of career preparation initiatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Track improvement over time with longitudinal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Demonstrate ROI of career services to stakeholders</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div className="aspect-square bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <div className="aspect-square bg-primary/20 rounded-lg flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-primary" />
                </div>
                <div className="aspect-square bg-primary/20 rounded-lg flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-primary" />
                </div>
                <div className="aspect-square bg-primary/20 rounded-lg flex items-center justify-center">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to get an icon for each metric
const getMetricIcon = (index: number) => {
  const icons = [
    <BarChart3 key="bar" className="h-4 w-4 text-primary" />,
    <LineChart key="line" className="h-4 w-4 text-primary" />,
    <PieChart key="pie" className="h-4 w-4 text-primary" />,
    <Users key="users" className="h-4 w-4 text-primary" />,
    <Brain key="brain" className="h-4 w-4 text-primary" />,
    <Clock key="clock" className="h-4 w-4 text-primary" />,
    <FileText key="file" className="h-4 w-4 text-primary" />,
    <Award key="award" className="h-4 w-4 text-primary" />,
    <BookOpen key="book" className="h-4 w-4 text-primary" />,
    <Trophy key="trophy" className="h-4 w-4 text-primary" />
  ];
  
  return icons[index % icons.length];
};

// Helper function to generate a description for each metric
const getMetricDescription = (metric: string) => {
  const descriptions: Record<string, string> = {
    // Performance metrics
    'Average Interview Score': 'Comprehensive evaluation of student interview performance across all sessions.',
    'Response Quality Rating': 'Measures clarity, relevance, and depth of student responses to interview questions.',
    'Question Comprehension Rate': 'Assesses how well students understand and address the actual questions asked.',
    'Communication Clarity Index': 'Evaluates articulation, pacing, and effectiveness of verbal communication.',
    'Technical Knowledge Assessment': 'Measures accuracy and depth of field-specific knowledge in responses.',
    'Problem-Solving Effectiveness': 'Evaluates approach, methodology, and solutions to scenario-based questions.',
    'Self-Presentation Score': 'Measures professionalism, confidence, and personal branding during interviews.',
    'Interview Completion Rate': 'Tracks percentage of students who complete the full interview process.',
    'Improvement Trajectory': 'Measures performance improvement across multiple practice sessions.',
    'Competency Gap Analysis': 'Identifies specific skill deficiencies across student populations.',
    
    // Engagement metrics
    'Active Student Count': 'Number of students actively using the platform in a given period.',
    'Practice Session Frequency': 'Average number of practice interviews per student per month.',
    'Average Session Duration': 'Typical length of interview practice sessions.',
    'Return Rate': 'Percentage of students who come back for additional practice.',
    'Feature Utilization': 'Which platform features students use most frequently.',
    'Feedback Implementation': 'How effectively students incorporate feedback in subsequent sessions.',
    'Resource Access Rate': 'Frequency of student engagement with supplementary learning resources.',
    'Peer Comparison Engagement': 'Student interaction with comparative performance data.',
    'Career Resource Utilization': 'Usage of job search and career planning tools.',
    'Community Participation': 'Engagement in peer learning and community features.',
    
    // Outcome metrics
    'Job Application Conversion': 'Rate at which practice leads to successful job applications.',
    'Interview Invitation Rate': 'Percentage of students receiving real interview invitations.',
    'Offer Acceptance Percentage': 'Rate of job offers received after platform preparation.',
    'Salary Negotiation Success': 'Improvement in compensation outcomes after training.',
    'Career Path Alignment': 'Match between student career goals and actual outcomes.',
    'Industry Placement Distribution': 'Breakdown of industries where students find employment.',
    'Employer Satisfaction Rating': 'Feedback from employers on student interview readiness.',
    'Graduate Employment Rate': 'Percentage of students employed within 6 months of graduation.',
    'Retention in First Position': 'Average tenure in first post-graduation position.',
    'Career Advancement Velocity': 'Rate at which graduates advance in their early career.'
  };
  
  return descriptions[metric] || 'Detailed analysis providing actionable insights for improvement.';
};

export default InstitutionMetrics;
