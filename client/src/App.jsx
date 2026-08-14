import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AuthProvider } from './features/auth';
import { NotificationProvider } from './features/notifications';
import { ToastProvider } from './context/ToastContext';
import Loader from './components/Loader';
import PwaInstallBanner from './components/PwaInstallBanner';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import './styles.css';

// Resilient lazy loader with auto-retry for Webpack dynamic imports & service worker cache updates
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenRefreshed = JSON.parse(
      window.sessionStorage.getItem('cc_page_refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('cc_page_refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenRefreshed) {
        window.sessionStorage.setItem('cc_page_refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

// Lazy loaded feature page components with automatic ChunkLoadError protection
const Home = lazyWithRetry(() => import('./features/marketing/pages/Home'));
const Login = lazyWithRetry(() => import('./features/auth/pages/Login'));
const Register = lazyWithRetry(() => import('./features/auth/pages/Register'));
const ForgotPassword = lazyWithRetry(() => import('./features/auth/pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./features/auth/pages/ResetPassword'));
const ChangePassword = lazyWithRetry(() => import('./features/auth/pages/ChangePassword'));
const DeleteAccount = lazyWithRetry(() => import('./features/auth/pages/DeleteAccount'));
const Dashboard = lazyWithRetry(() => import('./features/dashboard/pages/Dashboard'));
const Students = lazyWithRetry(() => import('./features/students/pages/Students'));
const ViewStudent = lazyWithRetry(() => import('./features/students/pages/ViewStudent'));
const Projects = lazyWithRetry(() => import('./features/projects/pages/Projects'));
const ViewProject = lazyWithRetry(() => import('./features/projects/pages/ViewProject'));
const AddProject = lazyWithRetry(() => import('./features/projects/pages/AddProject'));
const Groups = lazyWithRetry(() => import('./features/groups/pages/Groups'));
const CreateGroup = lazyWithRetry(() => import('./features/groups/pages/CreateGroup'));
const Events = lazyWithRetry(() => import('./features/events/pages/Events'));
const CreateEvent = lazyWithRetry(() => import('./features/events/pages/CreateEvent'));
const Notices = lazyWithRetry(() => import('./features/notices/pages/Notices'));
const PostNotice = lazyWithRetry(() => import('./features/notices/pages/PostNotice'));
const Resources = lazyWithRetry(() => import('./features/resources/pages/Resources'));
const PostResource = lazyWithRetry(() => import('./features/resources/pages/PostResource'));
const Leaderboard = lazyWithRetry(() => import('./features/leaderboard/pages/Leaderboard'));
const Messages = lazyWithRetry(() => import('./features/chat/pages/Messages'));
const Notifications = lazyWithRetry(() => import('./features/notifications/pages/Notifications'));
const Profile = lazyWithRetry(() => import('./features/auth/pages/Profile'));
const Contact = lazyWithRetry(() => import('./features/marketing/pages/Contact'));
const Search = lazyWithRetry(() => import('./features/search/pages/Search'));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <BrowserRouter>
              <PwaInstallBanner />
              <Suspense fallback={<Loader message="Loading CampusConnect..." />}>
                <Routes>
                  {/* Standalone Landing & Auth Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Shared Application & Dashboard Layout */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<ViewStudent />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ViewProject />} />
                    <Route path="/add-project" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                    <Route path="/notices" element={<Notices />} />
                    <Route path="/post-notice" element={<ProtectedRoute><PostNotice /></ProtectedRoute>} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/post-resource" element={<ProtectedRoute><PostResource /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                    <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/search" element={<Search />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}