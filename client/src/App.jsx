import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import Loader from './components/Loader';
import PwaInstallBanner from './components/PwaInstallBanner';
import ProtectedRoute from './components/ProtectedRoute';

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

// Lazy loaded page components with automatic ChunkLoadError protection
const Home = lazyWithRetry(() => import('./pages/Home'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const ChangePassword = lazyWithRetry(() => import('./pages/ChangePassword'));
const DeleteAccount = lazyWithRetry(() => import('./pages/DeleteAccount'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Students = lazyWithRetry(() => import('./pages/Students'));
const ViewStudent = lazyWithRetry(() => import('./pages/ViewStudent'));
const Projects = lazyWithRetry(() => import('./pages/Projects'));
const ViewProject = lazyWithRetry(() => import('./pages/ViewProject'));
const AddProject = lazyWithRetry(() => import('./pages/AddProject'));
const Groups = lazyWithRetry(() => import('./pages/Groups'));
const CreateGroup = lazyWithRetry(() => import('./pages/CreateGroup'));
const Events = lazyWithRetry(() => import('./pages/Events'));
const CreateEvent = lazyWithRetry(() => import('./pages/CreateEvent'));
const Notices = lazyWithRetry(() => import('./pages/Notices'));
const PostNotice = lazyWithRetry(() => import('./pages/PostNotice'));
const Resources = lazyWithRetry(() => import('./pages/Resources'));
const PostResource = lazyWithRetry(() => import('./pages/PostResource'));
const Leaderboard = lazyWithRetry(() => import('./pages/Leaderboard'));
const Messages = lazyWithRetry(() => import('./pages/Messages'));
const Notifications = lazyWithRetry(() => import('./pages/Notifications'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Search = lazyWithRetry(() => import('./pages/Search'));

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <BrowserRouter>
            <PwaInstallBanner />
            <Suspense fallback={<Loader message="Loading CampusConnect..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
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
                <Route path="/contact" element={<Contact />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}