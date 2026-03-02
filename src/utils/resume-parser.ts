/**
 * Utility functions to extract relevant information from resume files
 */

// Mock function to extract skills and location from resume content
export const extractSkillsAndLocationFromResume = async (resumeFile: any): Promise<{ skills: string[], location: string }> => {
  try {
    // In a real implementation, this would:
    // 1. Download the PDF content
    // 2. Parse the PDF to extract text
    // 3. Use NLP techniques to identify skills and location
    
    // For now, we'll simulate the extraction with mock data based on typical resume content
    // In a real implementation, we'd use a library like pdf.js to parse the PDF content
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock extraction based on resume filename or metadata
    const fileName = resumeFile.name.toLowerCase();
    
    // Define some common skill sets based on job types
    let skills: string[] = [];
    
    if (fileName.includes('software') || fileName.includes('engineer') || fileName.includes('developer')) {
      skills = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'Express'];
    } else if (fileName.includes('product') || fileName.includes('manager')) {
      skills = ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Analytics', 'Stakeholder Management'];
    } else if (fileName.includes('design') || fileName.includes('ui') || fileName.includes('ux')) {
      skills = ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'];
    } else if (fileName.includes('devops') || fileName.includes('cloud')) {
      skills = ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'CI/CD', 'Linux'];
    } else {
      // Default skills set
      skills = ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Project Management'];
    }
    
    // For location, we might extract from the resume content in a real implementation
    // For now, we'll return a default location or try to infer from filename
    let location = 'Remote';
    
    if (fileName.includes('sf') || fileName.includes('sanfran') || fileName.includes('california')) {
      location = 'San Francisco, CA';
    } else if (fileName.includes('nyc') || fileName.includes('newyork') || fileName.includes('manhattan')) {
      location = 'New York, NY';
    } else if (fileName.includes('austin') || fileName.includes('texas')) {
      location = 'Austin, TX';
    } else if (fileName.includes('seattle') || fileName.includes('washington')) {
      location = 'Seattle, WA';
    } else if (fileName.includes('remote') || fileName.includes('distributed')) {
      location = 'Remote';
    }
    
    return {
      skills,
      location
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