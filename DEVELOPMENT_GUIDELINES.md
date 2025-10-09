# Octavia Interview Buddy - Development Guidelines

## 🛠️ Development Guidelines & Standards

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Team**: Development Team  
**Project**: Octavia Interview Buddy  

---

## 📋 Overview

This document establishes coding standards, development practices, and guidelines for the Octavia Interview Buddy project. All team members must follow these guidelines to ensure code quality, maintainability, and consistency.

---

## 🏗️ Project Setup & Configuration

### **Prerequisites**
- **Node.js**: Version 18.x or higher
- **npm**: Latest stable version
- **Git**: Version 2.30 or higher
- **IDE**: VSCode recommended with extensions

### **Environment Setup**
```bash
# Clone repository
git clone <repository-url>
cd octavia-interview-buddy

# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:8080
```

### **Required VSCode Extensions**
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer

---

## 🎯 Technology Stack Standards

### **Frontend Framework**
- **React 18.3.1** with TypeScript (strict mode)
- **Vite** for build tooling and development
- **React Router DOM** for navigation
- **TanStack Query** for state management and data fetching

### **UI/Styling**
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Responsive design** (mobile-first approach)

### **Audio/Communication**
- **VAPI** for real-time audio communication and AI voice interactions
- **Web APIs** for audio recording and playback

---

## 📁 File Structure & Organization

### **Directory Structure**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── [feature]/       # Feature-specific components
│   └── [Component].tsx  # Individual components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── utils.ts         # General utilities
│   └── animations.ts    # Animation helpers
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

### **Naming Conventions**

#### **Files & Directories**
- Components: `PascalCase.tsx` (e.g., `StudentDashboard.tsx`)
- Pages: `PascalCase.tsx` (e.g., `StudentDashboardPage.tsx`)
- Hooks: `camelCase.ts` (e.g., `use-mobile.tsx`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`)
- Types: `camelCase.ts` (e.g., `user.types.ts`)

#### **Variables & Functions**
- Variables: `camelCase` (e.g., `studentName`)
- Functions: `camelCase` (e.g., `handleSubmit`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- Components: `PascalCase` (e.g., `StudentDashboard`)

#### **CSS Classes**
- Use Tailwind utility classes
- Custom classes: `kebab-case` (e.g., `custom-button`)
- Component-specific: `component-element` (e.g., `dashboard-header`)

---

## ⚛️ React Component Standards

### **Component Structure**
```typescript
import React, { useState, useEffect } from 'react';
import { ComponentProps } from './types';
import { Button } from '@/components/ui/button';

interface ExampleComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
  className?: string;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onSubmit,
  className
}) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Effect logic here
  }, []);

  const handleAction = () => {
    // Handler logic here
  };

  return (
    <div className={`base-classes ${className}`}>
      <h2>{title}</h2>
      <Button onClick={handleAction}>Action</Button>
    </div>
  );
};

export default ExampleComponent;
```

### **Component Guidelines**

#### **Props Interface**
- Always define TypeScript interfaces for props
- Use optional props with `?` where appropriate
- Include `className?: string` for styling flexibility
- Document complex props with JSDoc comments

#### **State Management**
- Use `useState` for local component state
- Use TanStack Query for server state
- Keep state as close to where it's used as possible
- Avoid prop drilling; use context for deeply nested data

#### **Event Handlers**
- Prefix with `handle` (e.g., `handleSubmit`, `handleClick`)
- Include proper TypeScript types for event parameters
- Use arrow functions for inline handlers
- Keep handlers focused and single-purpose

#### **Hooks Usage**
- Custom hooks in `hooks/` directory
- Prefix with `use` (e.g., `useAuth`, `useLocalStorage`)
- Extract complex logic into custom hooks
- Follow React hooks rules (no conditionals, loops)

---

## 🎨 Styling Guidelines

### **Tailwind CSS Standards**

#### **Class Organization**
```typescript
// Order: Layout → Spacing → Typography → Colors → Effects
<div className="flex flex-col gap-4 p-6 text-lg font-medium text-gray-900 bg-white rounded-lg shadow-md">
```

#### **Responsive Design**
```typescript
// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  // Content adapts to screen size
</div>
```

#### **Common Patterns**
```typescript
// Card component
<div className="bg-white rounded-lg border shadow-sm p-6">

// Button variants
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">

// Input field
<input className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
```

### **shadcn/ui Components**
- Use shadcn/ui components as base building blocks
- Extend with Tailwind classes for customization
- Maintain consistent design system
- Document any custom variants or modifications

---

## 📝 TypeScript Standards

### **Type Definitions**
```typescript
// Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Type for union types
type UserRole = 'student' | 'admin' | 'institution';

// Generic types for reusable components
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Utility types
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

### **TypeScript Guidelines**
- Enable strict mode in tsconfig.json
- Use explicit types for function parameters and returns
- Avoid `any` type; use `unknown` when necessary
- Use type guards for runtime type checking
- Leverage TypeScript utility types (Partial, Pick, Omit)

---

## 🔄 State Management

### **TanStack Query (React Query)**
```typescript
// Query for fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['students', institutionId],
  queryFn: () => fetchStudents(institutionId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation for updating data
const mutation = useMutation({
  mutationFn: updateStudent,
  onSuccess: () => {
    queryClient.invalidateQueries(['students']);
    toast.success('Student updated successfully');
  },
  onError: (error) => {
    toast.error('Failed to update student');
  },
});
```

### **Local State Patterns**
```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Object state with proper typing
const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  role: 'student',
});

// State updates
const updateFormData = (field: keyof FormData, value: any) => {
  setFormData(prev => ({
    ...prev,
    [field]: value,
  }));
};
```

---

## 🛣️ Routing Standards

### **Route Organization**
```typescript
// App.tsx route structure
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  
  {/* Protected routes */}
  <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
  
  {/* Nested routes */}
  <Route path="/admin/*" element={<AdminRoutes />} />
  
  {/* Catch all */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### **Navigation Patterns**
```typescript
// Programmatic navigation
const navigate = useNavigate();
const handleSubmit = () => {
  // Process form
  navigate('/success');
};

// Link components
<Link to="/dashboard" className="nav-link">Dashboard</Link>

// Route parameters
const { id } = useParams<{ id: string }>();
```

---

## 🧪 Testing Standards

### **Testing Strategy**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions
- **End-to-End Tests**: Complete user workflows

### **Testing Tools**
- **Vitest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking

### **Test Examples**
```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { StudentDashboard } from './StudentDashboard';

describe('StudentDashboard', () => {
  it('displays student information', () => {
    render(<StudentDashboard student={mockStudent} />);
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
  });
});

// Hook test
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns user information when authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 🚨 Error Handling

### **Error Boundaries**
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### **API Error Handling**
```typescript
// Query error handling
const { data, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3,
  onError: (error) => {
    toast.error(error.message || 'Something went wrong');
  },
});

// Try-catch for async operations
const handleSubmit = async () => {
  try {
    await submitData(formData);
    toast.success('Data submitted successfully');
  } catch (error) {
    toast.error('Failed to submit data');
    console.error('Submit error:', error);
  }
};
```

---

## 🔧 Performance Guidelines

### **React Performance**
```typescript
// Memoization for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(props.data);
}, [props.data]);

// Callback memoization
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Component memoization
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

### **Bundle Optimization**
```typescript
// Code splitting with lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Conditional imports
const AdminPanel = React.lazy(() => 
  import('./AdminPanel').then(module => ({ default: module.AdminPanel }))
);
```

### **Image Optimization**
- Use WebP format when possible
- Implement lazy loading for images
- Optimize image sizes for different screen densities
- Use CDN for static assets

---

## 🔒 Security Guidelines

### **Input Validation**
```typescript
// Zod schema validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
});

// Form validation
const validateForm = (data: unknown) => {
  try {
    return userSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid form data');
  }
};
```

### **XSS Prevention**
- Always sanitize user input
- Use React's built-in XSS protection
- Avoid `dangerouslySetInnerHTML` when possible
- Validate all props and state

### **Authentication**
```typescript
// Secure token storage
const useAuth = () => {
  const token = localStorage.getItem('authToken');
  const isAuthenticated = !!token && !isTokenExpired(token);
  
  return { isAuthenticated, token };
};
```

---

## 📚 Documentation Standards

### **Code Documentation**
```typescript
/**
 * Calculates the user's interview score based on multiple criteria
 * @param responses - Array of user responses
 * @param criteria - Scoring criteria configuration
 * @returns Calculated score between 0-100
 */
const calculateScore = (
  responses: InterviewResponse[],
  criteria: ScoringCriteria
): number => {
  // Implementation
};
```

### **Component Documentation**
```typescript
/**
 * StudentDashboard - Main dashboard component for students
 * 
 * Features:
 * - Display student information and progress
 * - Navigate to different sections (interviews, resumes)
 * - Show upcoming interviews and deadlines
 * 
 * @param student - Student data object
 * @param onNavigate - Navigation handler function
 */
interface StudentDashboardProps {
  student: Student;
  onNavigate: (section: string) => void;
}
```

### **README Files**
- Each major feature should have a README
- Include setup instructions
- Document API interfaces
- Provide usage examples

---

## 🔄 Git Workflow

### **Branch Naming**
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/refactor-description` - Code refactoring

### **Commit Messages**
```
type(scope): description

feat(auth): add multi-factor authentication
fix(dashboard): resolve session timeout issue
docs(readme): update installation instructions
style(button): improve hover state animations
refactor(api): optimize query performance
test(auth): add unit tests for login flow
```

### **Pull Request Process**
1. Create feature branch from `main`
2. Implement changes following these guidelines
3. Write/update tests
4. Update documentation
5. Submit PR with clear description
6. Address review feedback
7. Merge after approval

---

## 🚀 Deployment Guidelines

### **Environment Configuration**
```typescript
// Environment variables
const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  vapiUrl: import.meta.env.VITE_VAPI_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

### **Build Optimization**
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### **Performance Monitoring**
- Implement error tracking (Sentry)
- Monitor Core Web Vitals
- Track user interactions
- Monitor API performance

---

## ✅ Code Review Checklist

### **Functionality**
- [ ] Code meets requirements
- [ ] Edge cases are handled
- [ ] Error handling is implemented
- [ ] Performance is acceptable

### **Code Quality**
- [ ] Follows TypeScript standards
- [ ] Components are properly structured
- [ ] Naming conventions are followed
- [ ] Code is readable and maintainable

### **Testing**
- [ ] Unit tests are included
- [ ] Tests cover edge cases
- [ ] Tests are meaningful and not trivial
- [ ] All tests pass

### **Documentation**
- [ ] Code is properly documented
- [ ] README is updated if needed
- [ ] API changes are documented
- [ ] Breaking changes are noted

---

## 🛠️ Development Tools

### **Recommended VSCode Settings**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### **Useful Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
```

---

These guidelines ensure consistent, maintainable, and high-quality code across the Octavia Interview Buddy project. All team members should reference this document regularly and suggest improvements as the project evolves.