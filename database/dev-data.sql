-- Development Sample Data for Octavia Interview Buddy
-- This file contains sample data for testing and development

-- =============================================================================
-- SAMPLE INSTITUTIONS
-- =============================================================================

-- Insert sample institutions
INSERT INTO institutions (id, name, domain, website, admin_id, allowed_bookings_per_month, session_length) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Stanford University', 'stanford.edu', 'https://www.stanford.edu', NULL, 5, 15),
    ('22222222-2222-2222-2222-222222222222', 'Harvard University', 'harvard.edu', 'https://www.harvard.edu', NULL, 3, 20),
    ('33333333-3333-3333-3333-333333333333', 'MIT', 'mit.edu', 'https://www.mit.edu', NULL, 4, 15);

-- =============================================================================
-- SAMPLE USERS
-- =============================================================================

-- Platform Admin
INSERT INTO users (id, email, password_hash, name, role, is_email_verified) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@octavia-interview.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Platform Admin', 'platform_admin', TRUE);

-- Institution Admins
INSERT INTO users (id, email, password_hash, name, role, is_email_verified, institution_id) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@stanford.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Sarah Johnson', 'institution_admin', TRUE, '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@harvard.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Michael Chen', 'institution_admin', TRUE, '22222222-2222-2222-2222-222222222222'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'admin@mit.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Lisa Rodriguez', 'institution_admin', TRUE, '33333333-3333-3333-3333-333333333333');

-- Update institutions with admin IDs
UPDATE institutions SET admin_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE institutions SET admin_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE institutions SET admin_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' WHERE id = '33333333-3333-3333-3333-333333333333';

-- Sample Students
INSERT INTO users (id, email, password_hash, name, role, is_email_verified, institution_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'alex.smith@stanford.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Alex Smith', 'student', TRUE, '11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222', 'jane.doe@stanford.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Jane Doe', 'student', TRUE, '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333333', 'bob.wilson@harvard.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Bob Wilson', 'student', TRUE, '22222222-2222-2222-2222-222222222222'),
    ('44444444-4444-4444-4444-444444444444', 'emma.garcia@mit.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Emma Garcia', 'student', TRUE, '33333333-3333-3333-3333-333333333333'),
    ('55555555-5555-5555-5555-555555555555', 'david.kim@stanford.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'David Kim', 'student', FALSE, '11111111-1111-1111-1111-111111111111');

-- =============================================================================
-- SAMPLE SESSION DATA
-- =============================================================================

-- Session purchases
INSERT INTO session_purchases (id, institution_id, session_count, price_per_session, total_amount, status) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 100, 5.00, 500.00, 'completed'),
    ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 50, 6.00, 300.00, 'completed'),
    ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 75, 5.50, 412.50, 'completed');

-- Session pools
INSERT INTO session_pools (id, institution_id, total_sessions, used_sessions) VALUES
    ('aaaaaaaa-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 100, 15),
    ('bbbbbbbb-bbbb-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 50, 8),
    ('cccccccc-cccc-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 75, 12);

-- Session allocations
INSERT INTO session_allocations (id, session_pool_id, name, department_id, allocated_sessions, used_sessions) VALUES
    ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-1111-1111-111111111111', 'Computer Science', 'CS', 40, 8),
    ('22222222-bbbb-bbbb-bbbb-222222222222', 'aaaaaaaa-aaaa-1111-1111-111111111111', 'Business School', 'BUS', 30, 4),
    ('33333333-cccc-cccc-cccc-333333333333', 'aaaaaaaa-aaaa-1111-1111-111111111111', 'Engineering', 'ENG', 30, 3),
    ('44444444-dddd-dddd-dddd-444444444444', 'bbbbbbbb-bbbb-2222-2222-222222222222', 'Medical School', 'MED', 25, 5),
    ('55555555-eeee-eeee-eeee-555555555555', 'bbbbbbbb-bbbb-2222-2222-222222222222', 'Law School', 'LAW', 25, 3);

-- =============================================================================
-- SAMPLE RESUMES
-- =============================================================================

INSERT INTO resumes (id, student_id, type, file_name, parsed_content, skills, is_default) VALUES
    (
        'resume11-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'pdf',
        'alex_smith_resume.pdf',
        '{
            "name": "Alex Smith",
            "email": "alex.smith@stanford.edu",
            "summary": "Computer Science student with experience in full-stack development",
            "skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
            "experience": [
                {
                    "company": "Tech Startup Inc",
                    "position": "Software Engineering Intern",
                    "startDate": "2023-06",
                    "endDate": "2023-08",
                    "description": "Developed React components and REST APIs"
                }
            ],
            "education": [
                {
                    "institution": "Stanford University",
                    "degree": "Bachelor of Science",
                    "field": "Computer Science",
                    "startDate": "2021-09",
                    "endDate": "2025-06"
                }
            ]
        }',
        ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS'],
        TRUE
    ),
    (
        'resume22-2222-2222-2222-222222222222',
        '22222222-2222-2222-2222-222222222222',
        'linkedin',
        NULL,
        '{
            "name": "Jane Doe",
            "email": "jane.doe@stanford.edu",
            "summary": "Business student with marketing and analytics experience",
            "skills": ["Marketing", "Data Analysis", "Excel", "PowerPoint", "SQL"],
            "experience": [
                {
                    "company": "Marketing Agency",
                    "position": "Marketing Intern",
                    "startDate": "2023-05",
                    "endDate": "2023-08",
                    "description": "Analyzed campaign performance and created reports"
                }
            ],
            "education": [
                {
                    "institution": "Stanford University",
                    "degree": "Bachelor of Arts",
                    "field": "Business Administration",
                    "startDate": "2021-09",
                    "endDate": "2025-06"
                }
            ]
        }',
        ARRAY['Marketing', 'Data Analysis', 'Excel', 'PowerPoint', 'SQL', 'Google Analytics'],
        TRUE
    );

-- =============================================================================
-- SAMPLE INTERVIEWS
-- =============================================================================

INSERT INTO interviews (
    id, student_id, resume_id, scheduled_at, started_at, ended_at, 
    duration, status, type, transcript, overall_score
) VALUES
    (
        'interview1-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'resume11-1111-1111-1111-111111111111',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days' + INTERVAL '2 minutes',
        NOW() - INTERVAL '3 days' + INTERVAL '17 minutes',
        900,
        'completed',
        'technical',
        'Q: Tell me about yourself. A: I''m a Computer Science student at Stanford with experience in full-stack development... Q: What''s your experience with React? A: I''ve been working with React for about 2 years...',
        85
    ),
    (
        'interview2-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'resume11-1111-1111-1111-111111111111',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '1 minute',
        NOW() - INTERVAL '1 day' + INTERVAL '16 minutes',
        900,
        'completed',
        'behavioral',
        'Q: Tell me about a challenge you faced. A: During my internship, I had to learn a new framework quickly... Q: How do you handle pressure? A: I break down tasks into smaller parts...',
        78
    ),
    (
        'interview3-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'resume22-2222-2222-2222-222222222222',
        NOW() + INTERVAL '2 days',
        NULL,
        NULL,
        NULL,
        'scheduled',
        'general',
        NULL,
        NULL
    );

-- =============================================================================
-- SAMPLE INTERVIEW FEEDBACK
-- =============================================================================

INSERT INTO interview_feedback (
    id, interview_id, overall_score, strengths, improvements, recommendations, detailed_analysis
) VALUES
    (
        'feedback1-1111-1111-1111-111111111111',
        'interview1-1111-1111-1111-111111111111',
        85,
        ARRAY[
            'Clear communication style',
            'Strong technical knowledge',
            'Good use of specific examples'
        ],
        ARRAY[
            'Could provide more context in answers',
            'Speak a bit more slowly',
            'Use the STAR method for behavioral questions'
        ],
        ARRAY[
            'Practice explaining complex technical concepts',
            'Prepare more detailed project examples',
            'Work on confidence in delivery'
        ],
        'The candidate demonstrated strong technical knowledge and communication skills. Their experience with React and full-stack development came through clearly. Areas for improvement include providing more context and using structured approaches like STAR method for behavioral questions.'
    ),
    (
        'feedback2-2222-2222-2222-222222222222',
        'interview2-2222-2222-2222-222222222222',
        78,
        ARRAY[
            'Good problem-solving approach',
            'Shows resilience and adaptability',
            'Professional demeanor'
        ],
        ARRAY[
            'Answers could be more concise',
            'Provide more specific metrics',
            'Better preparation for common questions'
        ],
        ARRAY[
            'Practice the STAR method consistently',
            'Prepare quantifiable achievements',
            'Work on concise storytelling'
        ],
        'The candidate showed good problem-solving skills and adaptability. However, answers could be more structured and concise. The candidate would benefit from using the STAR method more consistently and preparing specific examples with measurable outcomes.'
    );

-- =============================================================================
-- SAMPLE STATISTICS
-- =============================================================================

-- Student statistics
INSERT INTO student_stats (
    student_id, total_interviews, completed_interviews, average_score, 
    last_interview_date, strongest_skills, areas_for_improvement
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        2,
        2,
        81.50,
        NOW() - INTERVAL '1 day',
        ARRAY['Technical Knowledge', 'Communication', 'Problem Solving'],
        ARRAY['Structure', 'Conciseness', 'Confidence']
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        1,
        0,
        0.00,
        NULL,
        ARRAY[],
        ARRAY[]
    );

-- Institution statistics
INSERT INTO institution_stats (
    institution_id, total_students, active_students, total_interviews, 
    average_score, session_utilization
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        3,
        2,
        3,
        81.50,
        15.00
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        1,
        1,
        0,
        0.00,
        16.00
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        1,
        1,
        0,
        0.00,
        16.00
    );

-- =============================================================================
-- SAMPLE NOTIFICATIONS
-- =============================================================================

INSERT INTO notifications (user_id, type, title, message) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'interview_feedback',
        'Interview Feedback Available',
        'Your feedback for the Technical Interview is now available. You scored 85/100!'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'interview_reminder',
        'Interview Reminder',
        'You have an upcoming interview scheduled for tomorrow at 2:00 PM.'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'session_usage',
        'Session Usage Update',
        'Your institution has used 15 out of 100 available interview sessions this month.'
    );

-- =============================================================================
-- PASSWORD NOTE
-- =============================================================================

-- Note: All sample users have the password "password123" 
-- Hash generated with: bcrypt.hash("password123", 12)
-- In production, users should change their passwords immediately