import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import Loader from './components/Loader';

import './styles.css';

// Lazy loaded page components for optimal initial page loading & route splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const ViewStudent = lazy(() => import('./pages/ViewStudent'));
const Projects = lazy(() => import('./pages/Projects'));
const ViewProject = lazy(() => import('./pages/ViewProject'));
const AddProject = lazy(() => import('./pages/AddProject'));
const Groups = lazy(() => import('./pages/Groups'));
const CreateGroup = lazy(() => import('./pages/CreateGroup'));
const Events = lazy(() => import('./pages/Events'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const Notices = lazy(() => import('./pages/Notices'));
const PostNotice = lazy(() => import('./pages/PostNotice'));
const Resources = lazy(() => import('./pages/Resources'));
const PostResource = lazy(() => import('./pages/PostResource'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));
const Search = lazy(() => import('./pages/Search'));

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<Loader message="Loading CampusConnect..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<ViewStudent />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ViewProject />} />
                <Route path="/add-project" element={<AddProject />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/create-group" element={<CreateGroup />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/post-notice" element={<PostNotice />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/post-resource" element={<PostResource />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
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