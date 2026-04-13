// web/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../shared/hooks/useAuth';
import './styles/global.css';

// Auth pages
import LoginGateway from './pages/LoginGateway';

// Student
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './components/student/StudentDashboard';
import StudentSubjects from './components/student/StudentSubjects';
import StudentQuiz from './components/student/StudentQuiz';
import StudentScores from './components/student/StudentScores';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminStudents from './components/admin/AdminStudents';
import AdminSubjects from './components/admin/AdminSubjects';
import AdminTeachers from './components/admin/AdminTeachers';

// Teacher
import TeacherLayout from './components/teacher/TeacherLayout';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherQuestions from './components/teacher/TeacherQuestions';
import TeacherScores from './components/teacher/TeacherScores';

// Super Admin
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import SuperAdminHOD from './components/superadmin/SuperAdminHOD';

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

function RoleRedirect() {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const paths = { student: '/student', admin: '/admin', teacher: '/teacher', superadmin: '/superadmin' };
  return <Navigate to={paths[role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGateway />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="quiz" element={<StudentQuiz />} />
            <Route path="scores" element={<StudentScores />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="teachers" element={<AdminTeachers />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="questions" element={<TeacherQuestions />} />
            <Route path="scores" element={<TeacherScores />} />
          </Route>

          {/* Super Admin */}
          <Route path="/superadmin" element={<ProtectedRoute allowedRole="superadmin"><SuperAdminLayout /></ProtectedRoute>}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="hod" element={<SuperAdminHOD />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
