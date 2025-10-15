-- Octavia Interview Buddy Database Schema
-- PostgreSQL Database Design
-- Supports multi-tenant architecture with institutions, students, and platform admins

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'institution_admin', 'platform_admin');
CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE interview_type AS ENUM ('behavioral', 'technical', 'general', 'industry_specific');
CREATE TYPE resume_type AS ENUM ('pdf', 'linkedin', 'voice');
CREATE TYPE session_purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE call_status AS ENUM ('idle', 'connecting', 'connected', 'ended', 'error');

-- =============================================================================
-- CORE USER TABLES
-- =============================================================================

-- Users table (base for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    profile_picture_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    firebase_uid VARCHAR(255) UNIQUE, -- Add Firebase UID column
    
    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Institutions table
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    website TEXT,
    logo_url TEXT,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Settings
    allowed_bookings_per_month INTEGER DEFAULT 0,
    session_length INTEGER DEFAULT 15, -- minutes
    require_resume_upload BOOLEAN DEFAULT TRUE,
    enable_department_allocations BOOLEAN DEFAULT FALSE,
    enable_student_groups BOOLEAN DEFAULT FALSE,
    
    -- Email notification settings
    enable_interview_reminders BOOLEAN DEFAULT TRUE,
    enable_feedback_emails BOOLEAN DEFAULT TRUE,
    enable_weekly_reports BOOLEAN DEFAULT FALSE,
    reminder_hours INTEGER DEFAULT 24,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_domain CHECK (domain ~* '^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Link users to institutions
ALTER TABLE users ADD COLUMN institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;

-- =============================================================================
-- SESSION AND BILLING TABLES
-- =============================================================================

-- Session purchases
CREATE TABLE session_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    session_count INTEGER NOT NULL CHECK (session_count > 0),
    price_per_session DECIMAL(10,2) NOT NULL CHECK (price_per_session >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Payment information
    payment_id VARCHAR(255), -- Stripe payment intent ID
    payment_method_id VARCHAR(255), -- Stripe payment method ID
    status session_purchase_status DEFAULT 'pending',
    
    -- Metadata
    purchase_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session pools (tracks available sessions for institutions)
CREATE TABLE session_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    used_sessions INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_session_counts CHECK (used_sessions <= total_sessions AND used_sessions >= 0)
);

-- Session allocations (department/student specific)
CREATE TABLE session_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_pool_id UUID NOT NULL REFERENCES session_pools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Department or student name
    department_id VARCHAR(255), -- External department identifier
    student_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For per-student allocations
    allocated_sessions INTEGER NOT NULL CHECK (allocated_sessions >= 0),
    used_sessions INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_allocation_counts CHECK (used_sessions <= allocated_sessions AND used_sessions >= 0)
);

-- Student session requests (for teacher approval)
CREATE TABLE student_session_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id VARCHAR(255) NOT NULL,
    session_count INTEGER NOT NULL CHECK (session_count > 0),
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id), -- Teacher who reviewed the request
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RESUME TABLES
-- =============================================================================

-- Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type resume_type NOT NULL,
    
    -- File information
    file_name VARCHAR(255),
    file_url TEXT,
    file_size INTEGER, -- bytes
    linkedin_url TEXT,
    voice_recording_url TEXT,
    
    -- Parsed content (stored as JSONB for flexibility)
    parsed_content JSONB NOT NULL DEFAULT '{}',
    
    -- Skills extracted from resume
    skills TEXT[], -- Array of skill keywords
    
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_linkedin_url CHECK (
        linkedin_url IS NULL OR 
        linkedin_url ~* '^https?://([a-z]+\.)?linkedin\.com/.*'
    ),
    CONSTRAINT only_one_default_per_student UNIQUE (student_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- =============================================================================
-- INTERVIEW TABLES
-- =============================================================================

-- Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    session_allocation_id UUID REFERENCES session_allocations(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- seconds
    
    status interview_status DEFAULT 'scheduled',
    type interview_type DEFAULT 'general',
    
    -- VAPI integration
    vapi_call_id VARCHAR(255),
    call_metadata JSONB,
    
    -- Content
    transcript TEXT,
    recording_url TEXT,
    recording_duration INTEGER, -- seconds
    
    -- Scoring
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    category_scores JSONB, -- {category: score} pairs
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_duration CHECK (
        duration IS NULL OR 
        (duration >= 0 AND duration <= 3600) -- Max 1 hour
    ),
    CONSTRAINT valid_timing CHECK (
        ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at
    )
);

-- Interview feedback
CREATE TABLE interview_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Detailed feedback
    strengths TEXT[],
    improvements TEXT[],
    recommendations TEXT[],
    detailed_analysis TEXT,
    
    -- Category breakdown
    category_feedback JSONB NOT NULL DEFAULT '[]',
    
    -- AI analysis metadata
    ai_model_version VARCHAR(50),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Student statistics (denormalized for performance)
CREATE TABLE student_stats (
    student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    total_interviews INTEGER DEFAULT 0,
    completed_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    last_interview_date TIMESTAMP WITH TIME ZONE,
    
    strongest_skills TEXT[],
    areas_for_improvement TEXT[],
    
    -- Engagement metrics
    total_session_time INTEGER DEFAULT 0, -- seconds
    sessions_this_month INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institution statistics (denormalized for performance)
CREATE TABLE institution_stats (
    institution_id UUID PRIMARY KEY REFERENCES institutions(id) ON DELETE CASCADE,
    
    total_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0, -- students with activity in last 30 days
    total_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    
    -- Usage metrics
    session_utilization DECIMAL(5,2) DEFAULT 0, -- percentage of purchased sessions used
    monthly_usage JSONB DEFAULT '[]', -- Array of {month, year, interviews, students, avgScore}
    
    -- Performance by department
    department_stats JSONB DEFAULT '{}',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AUDIT AND LOGGING TABLES
-- =============================================================================

-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    -- Additional data
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Notification metadata
    data JSONB,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_email_verified ON users(is_email_verified);

-- Institution indexes
CREATE INDEX idx_institutions_domain ON institutions(domain);
CREATE INDEX idx_institutions_active ON institutions(is_active);

-- Resume indexes
CREATE INDEX idx_resumes_student ON resumes(student_id);
CREATE INDEX idx_resumes_type ON resumes(type);
CREATE INDEX idx_resumes_skills ON resumes USING gin(skills);
CREATE INDEX idx_resumes_default ON resumes(student_id, is_default);

-- Interview indexes
CREATE INDEX idx_interviews_student ON interviews(student_id);
CREATE INDEX idx_interviews_resume ON interviews(resume_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_created ON interviews(created_at);
CREATE INDEX idx_interviews_vapi_call ON interviews(vapi_call_id);

-- Session indexes
CREATE INDEX idx_session_purchases_institution ON session_purchases(institution_id);
CREATE INDEX idx_session_purchases_status ON session_purchases(status);
CREATE INDEX idx_session_pools_institution ON session_pools(institution_id);
CREATE INDEX idx_session_allocations_pool ON session_allocations(session_pool_id);

-- Activity log indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_institution ON activity_logs(institution_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_purchases_updated_at BEFORE UPDATE ON session_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_pools_updated_at BEFORE UPDATE ON session_pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to get available sessions for a user
CREATE OR REPLACE FUNCTION get_available_sessions(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    institution_id UUID;
    available_sessions INTEGER;
BEGIN
    -- Get user's institution
    SELECT u.institution_id INTO institution_id
    FROM users u WHERE u.id = user_id;
    
    IF institution_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate available sessions
    SELECT (sp.total_sessions - sp.used_sessions)
    INTO available_sessions
    FROM session_pools sp
    WHERE sp.institution_id = institution_id;
    
    RETURN COALESCE(available_sessions, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to consume a session
CREATE OR REPLACE FUNCTION consume_session(student_id UUID, allocation_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    institution_id UUID;
    session_pool_id UUID;
BEGIN
    -- Get student's institution
    SELECT u.institution_id INTO institution_id
    FROM users u WHERE u.id = student_id;
    
    IF institution_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get session pool
    SELECT sp.id INTO session_pool_id
    FROM session_pools sp
    WHERE sp.institution_id = institution_id;
    
    IF session_pool_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check and consume from allocation if specified
    IF allocation_id IS NOT NULL THEN
        UPDATE session_allocations
        SET used_sessions = used_sessions + 1
        WHERE id = allocation_id 
          AND used_sessions < allocated_sessions;
        
        IF NOT FOUND THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Consume from main pool
    UPDATE session_pools
    SET used_sessions = used_sessions + 1
    WHERE id = session_pool_id 
      AND used_sessions < total_sessions;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Create a default platform admin (password should be changed immediately)
INSERT INTO users (email, password_hash, name, role, is_email_verified)
VALUES (
    'admin@octavia-interview.com',
    '$2b$12$example_hash_replace_with_real_hash',
    'Platform Administrator',
    'platform_admin',
    TRUE
);

-- =============================================================================
-- SECURITY POLICIES (RLS)
-- =============================================================================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_allocations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (except admins)
CREATE POLICY users_own_data ON users
    FOR ALL
    USING (
        id = current_setting('app.current_user_id')::uuid OR
        current_setting('app.current_user_role')::text = 'platform_admin'
    );

-- Students can only see their own resumes and interviews
CREATE POLICY students_own_resumes ON resumes
    FOR ALL
    USING (
        student_id = current_setting('app.current_user_id')::uuid OR
        current_setting('app.current_user_role')::text IN ('institution_admin', 'platform_admin')
    );

CREATE POLICY students_own_interviews ON interviews
    FOR ALL
    USING (
        student_id = current_setting('app.current_user_id')::uuid OR
        current_setting('app.current_user_role')::text IN ('institution_admin', 'platform_admin')
    );

-- Institution admins can see their institution's data
CREATE POLICY institution_admin_access ON institutions
    FOR ALL
    USING (
        admin_id = current_setting('app.current_user_id')::uuid OR
        current_setting('app.current_user_role')::text = 'platform_admin'
    );

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE users IS 'Core user accounts for students, institution admins, and platform admins';
COMMENT ON TABLE institutions IS 'Educational institutions using the platform';
COMMENT ON TABLE resumes IS 'Student resumes in various formats (PDF, LinkedIn, voice)';
COMMENT ON TABLE interviews IS 'AI-powered interview sessions with VAPI integration';
COMMENT ON TABLE session_purchases IS 'Session purchases by institutions';
COMMENT ON TABLE session_pools IS 'Available interview sessions per institution';
COMMENT ON TABLE session_allocations IS 'Department/group-specific session allocations';
COMMENT ON TABLE interview_feedback IS 'AI-generated feedback for completed interviews';
COMMENT ON TABLE student_stats IS 'Aggregated statistics for student performance';
COMMENT ON TABLE institution_stats IS 'Aggregated statistics for institution performance';
COMMENT ON TABLE activity_logs IS 'Audit trail of user actions';
COMMENT ON TABLE notifications IS 'In-app notifications for users';

COMMENT ON FUNCTION get_available_sessions(UUID) IS 'Returns the number of available interview sessions for a user';
COMMENT ON FUNCTION consume_session(UUID, UUID) IS 'Consumes one interview session for a student, returns success status';