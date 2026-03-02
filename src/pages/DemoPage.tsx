import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, BookOpen, Trophy, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Experience Octavia Interview Buddy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our AI-powered interview preparation platform can help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sample Interview</CardTitle>
                <CardDescription>Try a brief sample interview scenario</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Experience our AI interviewer with a sample question to see how our platform evaluates your responses.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="font-medium">AI Interviewer:</p>
                  <p className="italic">"Tell me about a time you faced a challenging problem at work and how you solved it."</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Sample response evaluation...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interview Prep Resources</CardTitle>
                <CardDescription>Access sample questions and tips</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Common interview questions by industry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Answer frameworks and best practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Industry-specific tips and trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Mock interview guides</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-6">What You'll Get with Premium Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted rounded-lg">
                <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Detailed Feedback</h3>
                <p className="text-sm text-muted-foreground">AI-powered analysis of your answers, body language, and communication skills</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Scenarios</h3>
                <p className="text-sm text-muted-foreground">Practice with various interview types and industry-specific questions</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <Star className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">Track your improvement over time with detailed analytics</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-primary/5 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">Ready to Level Up Your Interview Skills?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their interview performance with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscribe">
                <Button size="lg" className="px-8 gap-2 bg-primary hover:bg-primary/90 text-white">
                  Subscribe Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup-external">
                <Button size="lg" variant="outline" className="px-8">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Experience the power of AI-driven interview preparation. Sign up today to unlock unlimited practice sessions.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoPage;