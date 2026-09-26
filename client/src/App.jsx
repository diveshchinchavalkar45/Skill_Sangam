import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Authenticated Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ExploreProjectsPage from './pages/ExploreProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CandidateRecommendationsPage from './pages/CandidateRecommendationsPage';
import TeamManagementPage from './pages/TeamManagementPage';
import RequestsPage from './pages/RequestsPage';
import InvitationsPage from './pages/InvitationsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';

// Student Academic Assignment & Community Pages
import AssignmentsPage from './pages/student/AssignmentsPage';
import AssignmentDetailPage from './pages/student/AssignmentDetailPage';

// Organizer Pages
import OrganizerDashboardPage from './pages/organizer/OrganizerDashboardPage';
import OrganizerUsersPage from './pages/organizer/OrganizerUsersPage';
import OrganizerProjectsPage from './pages/organizer/OrganizerProjectsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />

            {/* Project Exploration (accessible publicly, enriched when authenticated) */}
            <Route path="projects" element={<ExploreProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="users/:id" element={<ProfilePage />} />

            {/* Authenticated Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/new"
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id/edit"
              element={
                <ProtectedRoute>
                  <EditProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id/candidates"
              element={
                <ProtectedRoute>
                  <CandidateRecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id/team"
              element={
                <ProtectedRoute>
                  <TeamManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="requests"
              element={
                <ProtectedRoute>
                  <RequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="invitations"
              element={
                <ProtectedRoute>
                  <InvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Student Assignment & Community Routes */}
            <Route
              path="student/assignments"
              element={
                <ProtectedRoute>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/assignments/:id"
              element={
                <ProtectedRoute>
                  <AssignmentDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="organizer"
              element={
                <ProtectedRoute organizerOnly={true}>
                  <OrganizerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="organizer/users"
              element={
                <ProtectedRoute organizerOnly={true}>
                  <OrganizerUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="organizer/projects"
              element={
                <ProtectedRoute organizerOnly={true}>
                  <OrganizerProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="organizer/events/:eventId"
              element={
                <ProtectedRoute organizerOnly={true}>
                  <OrganizerDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
