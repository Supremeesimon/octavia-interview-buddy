import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, FileText, Upload, Calendar, Clock, Download, Pencil, Trash2, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ResumesList = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const mockResumes = [
    {
      id: 1,
      name: 'Software Developer Resume',
      lastUpdated: 'May 15, 2023',
      format: 'PDF',
      size: '245 KB',
      isDefault: true
    },
    {
      id: 2,
      name: 'UX Designer Portfolio',
      lastUpdated: 'Jan 10, 2023',
      format: 'PDF',
      size: '1.2 MB',
      isDefault: false
    },
    {
      id: 3,
      name: 'Technical Resume',
      lastUpdated: 'Mar 22, 2023',
      format: 'DOCX',
      size: '320 KB',
      isDefault: false
    }
  ];

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'resumes':
        // Stay on this page
        break;
      case 'interviews':
        navigate('/interview');
        break;
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-6">
        <Tabs defaultValue="resumes" className="w-full mb-6" onValueChange={handleTabChange}>
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="interviews" className="flex-1">
              Interviews
            </TabsTrigger>
            <TabsTrigger value="resumes" className="flex-1">
              Resumes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Resumes</h1>
        
        <Button className="gap-2" tooltip="Upload or create a new resume">
          <Plus className="h-4 w-4" />
          Add New Resume
        </Button>
      </div>
      
      {mockResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockResumes.map(resume => (
            <Card key={resume.id} className={resume.isDefault ? 'border-primary/30' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {resume.name}
                  </CardTitle>
                  {resume.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Last updated: {resume.lastUpdated}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="bg-muted px-2 py-1 rounded-full">{resume.format}</span>
                  <span className="bg-muted px-2 py-1 rounded-full">{resume.size}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-1" tooltip="Download this resume">
                  <Download className="h-4 w-4" />
                  {!isMobile && "Download"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1" tooltip="Edit this resume">
                  <Pencil className="h-4 w-4" />
                  {!isMobile && "Edit"}
                </Button>
                {!resume.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-destructive hover:text-destructive"
                    tooltip="Delete this resume"
                  >
                    <Trash2 className="h-4 w-4" />
                    {!isMobile && "Delete"}
                  </Button>
                )}
                {!resume.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    tooltip="Make this your default resume"
                  >
                    Set as Default
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No resumes uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your resume to apply for jobs and prepare for interviews
          </p>
          <Button className="gap-2" tooltip="Upload your first resume">
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResumesList;
