
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, PieChart, LineChart, Users, Brain, Clock, FileText, 
  Gauge, Award, Briefcase, BookOpen, Trophy, Calendar, PersonStanding,
  FileBarChart, UserCog, PencilRuler, ScrollText, CheckCircle2, Database
} from 'lucide-react';

const InstitutionMetrics = () => {
  // Expanded and organized metrics based on the 30 metadata points
  const metricCategories = [
    {
      id: 'resume',
      name: 'Resume Analytics',
      icon: <FileText className="h-5 w-5 text-primary" />,
      metrics: [
        {
          name: 'Resume Views by Employers',
          description: 'Helps measure student visibility and interest from recruiters.',
          icon: <FileBarChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'Section Time Analysis',
          description: 'Shows which resume sections are strong or weak—helps in targeted improvement.',
          icon: <Clock className="h-4 w-4 text-primary" />
        },
        {
          name: 'Contact Link Click-through Rates',
          description: 'Indicates how often employers try to reach out; early signs of employer interest.',
          icon: <UserCog className="h-4 w-4 text-primary" />
        },
        {
          name: 'Resume Download Frequency',
          description: 'Gauges employer intent to save/share for recruitment consideration.',
          icon: <FileText className="h-4 w-4 text-primary" />
        },
        {
          name: 'Employer Engagement Heatmaps',
          description: 'Visual representation of what parts employers pay attention to most.',
          icon: <PieChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'Resume Improvement Scores',
          description: 'Tracks how students evolve their resumes, helps institutions measure progress.',
          icon: <LineChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'AI Text Expansion Usage',
          description: 'Indicates initiative—students using tools to enhance their resume quality.',
          icon: <PencilRuler className="h-4 w-4 text-primary" />
        },
        {
          name: 'Resumes Generated Per Student',
          description: 'Reflects effort and preparation level across different job types.',
          icon: <ScrollText className="h-4 w-4 text-primary" />
        },
        {
          name: 'Job Matches Per Student',
          description: 'Institutions see job readiness and market alignment.',
          icon: <CheckCircle2 className="h-4 w-4 text-primary" />
        },
        {
          name: 'Job Match Click-through Rate',
          description: 'Indicates how actively students are pursuing relevant opportunities.',
          icon: <Briefcase className="h-4 w-4 text-primary" />
        }
      ]
    },
    {
      id: 'interview',
      name: 'Interview Analytics',
      icon: <Users className="h-5 w-5 text-primary" />,
      metrics: [
        {
          name: 'Response Quality Scores',
          description: 'Helps gauge communication skills and readiness level objectively.',
          icon: <Gauge className="h-4 w-4 text-primary" />
        },
        {
          name: 'Common Mistake Patterns',
          description: 'Pinpoints training gaps to improve curriculum or coaching.',
          icon: <BarChart3 className="h-4 w-4 text-primary" />
        },
        {
          name: 'Question Response Timing',
          description: 'Helps detect hesitation or overconfidence—fine-tune practice sessions.',
          icon: <Clock className="h-4 w-4 text-primary" />
        },
        {
          name: 'Sentiment Analysis',
          description: 'Institutions get insight into students\' composure and confidence.',
          icon: <Brain className="h-4 w-4 text-primary" />
        },
        {
          name: 'Keyword Usage Analysis',
          description: 'Measures how well students use industry-relevant language.',
          icon: <FileText className="h-4 w-4 text-primary" />
        },
        {
          name: 'Mock Interview Attempts',
          description: 'Reflects student engagement and effort levels.',
          icon: <Calendar className="h-4 w-4 text-primary" />
        },
        {
          name: 'Topic-specific Performance',
          description: 'Shows strengths/weaknesses in behavioral, technical, or situational questions.',
          icon: <BookOpen className="h-4 w-4 text-primary" />
        },
        {
          name: 'AI Feedback Engagement',
          description: 'Whether students are learning from feedback or ignoring it.',
          icon: <UserCog className="h-4 w-4 text-primary" />
        },
        {
          name: 'Interview Progress Trajectory',
          description: 'Clear improvement graph showing training impact over time.',
          icon: <LineChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'Peer Performance Benchmarks',
          description: 'Institutions can compare students and identify those needing extra support.',
          icon: <Users className="h-4 w-4 text-primary" />
        },
        {
          name: 'Interview Difficulty Tolerance',
          description: 'Shows how students perform under pressure—preparation depth indicator.',
          icon: <Gauge className="h-4 w-4 text-primary" />
        },
        {
          name: 'Confidence Assessment',
          description: 'AI evaluates vocal tone and fluency to estimate self-assurance.',
          icon: <PersonStanding className="h-4 w-4 text-primary" />
        },
        {
          name: 'Interview Improvement Score',
          description: 'Progress marker showing direct value of using Octavia.',
          icon: <Trophy className="h-4 w-4 text-primary" />
        },
        {
          name: 'AI Question Frequency by Industry',
          description: 'Helps institutions optimize question banks and simulate real-world interviews.',
          icon: <Briefcase className="h-4 w-4 text-primary" />
        },
        {
          name: 'Interview Session Drop-off Rates',
          description: 'Highlights potential disengagement or lack of preparedness.',
          icon: <BarChart3 className="h-4 w-4 text-primary" />
        }
      ]
    },
    {
      id: 'institutional',
      name: 'Institutional Intelligence',
      icon: <Database className="h-5 w-5 text-primary" />,
      metrics: [
        {
          name: 'Resume-Interview Correlation',
          description: 'See how writing skills align with verbal performance.',
          icon: <LineChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'Feature Engagement Heatmap',
          description: 'Tracks which tools students use most—helps prioritize platform enhancements.',
          icon: <PieChart className="h-4 w-4 text-primary" />
        },
        {
          name: 'License Activation & Usage',
          description: 'Track how well students adopt the tool; ROI measurement.',
          icon: <Award className="h-4 w-4 text-primary" />
        },
        {
          name: 'Early Risk Detection',
          description: 'Automatically surfaces students likely to struggle in real-world interviews.',
          icon: <Gauge className="h-4 w-4 text-primary" />
        },
        {
          name: 'Cohort Performance Dashboard',
          description: 'Institution gains bird's-eye view of employability metrics and program impact.',
          icon: <BarChart3 className="h-4 w-4 text-primary" />
        }
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
            Each institution gets access to these metrics for their students and departments.
          </p>
        </div>

        <Tabs defaultValue="resume" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-1 md:grid-cols-3">
              {metricCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
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
                        {metric.icon}
                        <span>{metric.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                      <div className="mt-3 text-xs text-primary/70 font-medium">
                        Available per student and department
                      </div>
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
              <div className="mt-6">
                <Link to="/dashboard" className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors inline-flex">
                  View Institution Dashboard Demo
                </Link>
              </div>
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

export default InstitutionMetrics;
