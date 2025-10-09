const db = require('../config/database');

const analyticsController = {
  // Get student analytics
  async getStudentAnalytics(req, res) {
    try {
      const userId = req.user.id;

      // Get student stats
      const statsResult = await db.query(
        `SELECT total_interviews, completed_interviews, average_score, improvement_rate,
                last_interview_date, strongest_skills, areas_for_improvement,
                total_session_time, sessions_this_month, streak_days, updated_at
         FROM student_stats 
         WHERE student_id = $1`,
        [userId]
      );

      const stats = statsResult.rows[0] || null;

      // Get recent interviews with scores
      const interviewsResult = await db.query(
        `SELECT id, scheduled_at, started_at, ended_at, duration, status, type,
                overall_score, category_scores
         FROM interviews 
         WHERE student_id = $1 AND status = 'completed'
         ORDER BY scheduled_at DESC
         LIMIT 10`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          stats,
          recentInterviews: interviewsResult.rows
        }
      });
    } catch (error) {
      console.error('Get student analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get institution analytics
  async getInstitutionAnalytics(req, res) {
    try {
      const institutionId = req.user.institutionId;

      // Get institution stats
      const statsResult = await db.query(
        `SELECT total_students, active_students, total_interviews, average_score,
                session_utilization, monthly_usage, department_stats, updated_at
         FROM institution_stats 
         WHERE institution_id = $1`,
        [institutionId]
      );

      const stats = statsResult.rows[0] || null;

      // Get recent activity
      const activityResult = await db.query(
        `SELECT u.id as user_id, u.name as user_name, u.email, 
                i.id as interview_id, i.scheduled_at, i.status, i.overall_score
         FROM users u
         LEFT JOIN interviews i ON u.id = i.student_id
         WHERE u.institution_id = $1 AND u.role = 'student'
         ORDER BY i.scheduled_at DESC
         LIMIT 20`,
        [institutionId]
      );

      res.json({
        success: true,
        data: {
          stats,
          recentActivity: activityResult.rows
        }
      });
    } catch (error) {
      console.error('Get institution analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get platform analytics
  async getPlatformAnalytics(req, res) {
    try {
      // Get overall platform stats
      const platformStats = await db.query(
        `SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'institution_admin') as total_institutions,
          (SELECT COUNT(*) FROM interviews WHERE status = 'completed') as total_interviews,
          (SELECT AVG(overall_score) FROM interviews WHERE status = 'completed' AND overall_score IS NOT NULL) as platform_average_score`
      );

      // Get recent signups
      const recentSignups = await db.query(
        `SELECT id, email, name, role, institution_id, created_at
         FROM users 
         WHERE created_at > NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 50`
      );

      // Get top institutions by interviews
      const topInstitutions = await db.query(
        `SELECT i.name, i.domain, 
                COUNT(int.id) as interview_count,
                AVG(int.overall_score) as avg_score
         FROM institutions i
         LEFT JOIN users u ON i.id = u.institution_id
         LEFT JOIN interviews int ON u.id = int.student_id AND int.status = 'completed'
         GROUP BY i.id, i.name, i.domain
         ORDER BY interview_count DESC
         LIMIT 10`
      );

      res.json({
        success: true,
        data: {
          platformStats: platformStats.rows[0],
          recentSignups: recentSignups.rows,
          topInstitutions: topInstitutions.rows
        }
      });
    } catch (error) {
      console.error('Get platform analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Export analytics data
  async exportAnalytics(req, res) {
    try {
      const { type, format } = req.query;
      const userId = req.user.id;

      let data = null;
      let filename = 'analytics-export';

      switch (type) {
        case 'interviews':
          filename = 'interview-history';
          const interviewsResult = await db.query(
            `SELECT id, scheduled_at, started_at, ended_at, duration, status, type,
                    transcript, recording_url, overall_score, category_scores, created_at
             FROM interviews 
             WHERE student_id = $1 
             ORDER BY scheduled_at DESC`,
            [userId]
          );
          data = interviewsResult.rows;
          break;

        case 'resumes':
          filename = 'resume-history';
          const resumesResult = await db.query(
            `SELECT id, type, file_name, file_url, created_at, skills
             FROM resumes 
             WHERE student_id = $1 
             ORDER BY created_at DESC`,
            [userId]
          );
          data = resumesResult.rows;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format || 'json'}"`);
      res.setHeader('Content-Type', 'application/json');

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = analyticsController;