/**
 * Utility functions to extract relevant information from resume files
 */
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source using unpkg to ensure we get the correct version matching our package
// We use the version from the installed package to ensure compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extract text content from a File object (PDF or Text)
 */
export const extractTextFromResume = async (file: File): Promise<string> => {
  try {
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    } else if (file.type === 'text/plain') {
      return await file.text();
    } else {
      console.warn('Unsupported file type for text extraction:', file.type);
      return `[Resume file: ${file.name}] (Content extraction not supported for this file type)`;
    }
  } catch (error) {
    console.error('Error extracting text from resume:', error);
    return `[Resume file: ${file.name}] (Error extracting content: ${error.message})`;
  }
};

/**
 * Extract text from a PDF file
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through each page
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to parse PDF content');
  }
};

// Mock function to extract skills and location from resume content
// Updated to use the extracted text if available
export const extractSkillsAndLocationFromResume = async (resumeFile: any): Promise<{ skills: string[], location: string, text?: string }> => {
  try {
    // Attempt to extract real text first
    let text = '';
    if (resumeFile instanceof File) {
      text = await extractTextFromResume(resumeFile);
    }
    
    // Determine skills based on filename OR content
    const contentToAnalyze = (text + ' ' + (resumeFile.name || '')).toLowerCase();
    
    // Define some common skill sets based on job types
    let skills: string[] = [];
    
    if (contentToAnalyze.includes('software') || contentToAnalyze.includes('engineer') || contentToAnalyze.includes('developer') || contentToAnalyze.includes('javascript')) {
      skills = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'Express'];
    } else if (contentToAnalyze.includes('product') || contentToAnalyze.includes('manager') || contentToAnalyze.includes('roadmap')) {
      skills = ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Analytics', 'Stakeholder Management'];
    } else if (contentToAnalyze.includes('design') || contentToAnalyze.includes('ui') || contentToAnalyze.includes('ux') || contentToAnalyze.includes('figma')) {
      skills = ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'];
    } else if (contentToAnalyze.includes('devops') || contentToAnalyze.includes('cloud') || contentToAnalyze.includes('aws')) {
      skills = ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'CI/CD', 'Linux'];
    } else {
      // Default skills set
      skills = ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Project Management'];
    }
    
    // For location, we might extract from the resume content in a real implementation
    // For now, we'll return a default location or try to infer from filename
    let location = 'Remote';
    
    if (contentToAnalyze.includes('sf') || contentToAnalyze.includes('san francisco') || contentToAnalyze.includes('california')) {
      location = 'San Francisco, CA';
    } else if (contentToAnalyze.includes('nyc') || contentToAnalyze.includes('new york') || contentToAnalyze.includes('manhattan')) {
      location = 'New York, NY';
    } else if (contentToAnalyze.includes('austin') || contentToAnalyze.includes('texas')) {
      location = 'Austin, TX';
    } else if (contentToAnalyze.includes('seattle') || contentToAnalyze.includes('washington')) {
      location = 'Seattle, WA';
    } else if (contentToAnalyze.includes('remote') || contentToAnalyze.includes('distributed')) {
      location = 'Remote';
    }
    
    return {
      skills,
      location,
      text // Return the extracted text so it can be used by the caller
    };
  } catch (error) {
    console.error('Error extracting data from resume:', error);
    // Return default values in case of error
    return {
      skills: ['Communication', 'Problem Solving', 'Teamwork'],
      location: 'Remote'
    };
  }
};

// Function to get job recommendations based on extracted skills and location
export const getJobRecommendations = async (skills: string[], location: string): Promise<any[]> => {
  try {
    // In a real implementation, this would call a backend service
    // that matches skills and location to available jobs
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create mock jobs based on skills and location
    const mockJobs = [
      {
        id: 1,
        title: skills.some(skill => ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python'].includes(skill)) 
          ? 'Senior Software Engineer' 
          : skills.some(skill => ['Product Strategy', 'Agile', 'Roadmapping'].includes(skill))
            ? 'Product Manager'
            : skills.some(skill => ['Figma', 'Adobe XD', 'User Research'].includes(skill))
              ? 'UX/UI Designer'
              : 'Specialist Position',
        company: getRandomCompanyName(),
        location: location,
        salary: getSalaryRange(skills),
        type: 'Full-time',
        description: `We are looking for a candidate with expertise in ${skills.slice(0, 3).join(', ')} and related technologies...`,
        posted: `${Math.floor(Math.random() * 7) + 1} day${Math.floor(Math.random() * 7) + 1 > 1 ? 's' : ''} ago`,
        skills: skills.slice(0, 5)
      },
      {
        id: 2,
        title: skills.some(skill => ['AWS', 'Docker', 'Kubernetes', 'Jenkins'].includes(skill))
          ? 'DevOps Engineer'
          : skills.some(skill => ['Analytics', 'Data', 'SQL', 'Python'].includes(skill))
            ? 'Data Analyst'
            : 'Associate Role',
        company: getRandomCompanyName(),
        location: location,
        salary: getSalaryRange(skills),
        type: 'Full-time',
        description: `Join our team to work with ${skills.slice(0, 2).join(' and ')} technologies and contribute to innovative projects...`,
        posted: `${Math.floor(Math.random() * 14) + 1} day${Math.floor(Math.random() * 14) + 1 > 1 ? 's' : ''} ago`,
        skills: skills.slice(0, 5)
      },
      {
        id: 3,
        title: skills.some(skill => ['Leadership', 'Management', 'Strategy'].includes(skill))
          ? 'Team Lead'
          : skills.some(skill => ['Marketing', 'Growth', 'Social Media'].includes(skill))
            ? 'Growth Marketer'
            : 'Mid-Level Position',
        company: getRandomCompanyName(),
        location: location,
        salary: getSalaryRange(skills),
        type: 'Full-time',
        description: `Exciting opportunity for someone with experience in ${skills.slice(1, 4).join(', ')}...`,
        posted: `${Math.floor(Math.random() * 5) + 1} day${Math.floor(Math.random() * 5) + 1 > 1 ? 's' : ''} ago`,
        skills: skills.slice(0, 5)
      }
    ];
    
    return mockJobs;
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return [];
  }
};

// Helper function to generate random company names
const getRandomCompanyName = (): string => {
  const prefixes = ['Tech', 'Digital', 'Innovative', 'Global', 'NextGen', 'Future', 'Smart', 'Cloud', 'Data', 'AI'];
  const suffixes = ['Solutions', 'Systems', 'Labs', 'Technologies', 'Enterprises', 'Dynamics', 'Ventures', 'Group'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
};

// Helper function to generate salary ranges based on skills
const getSalaryRange = (skills: string[]): string => {
  // Base salary range
  let min = 80000;
  let max = 130000;
  
  // Adjust based on in-demand skills
  if (skills.some(skill => ['AI', 'Machine Learning', 'Blockchain', 'Cloud', 'Cybersecurity'].includes(skill))) {
    min += 20000;
    max += 30000;
  }
  
  // Convert to currency format
  return `$${Math.round(min / 1000).toString()}k - $${Math.round(max / 1000).toString()}k`;
};
