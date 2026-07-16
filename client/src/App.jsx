import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import DeleteAccount from './pages/DeleteAccount';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ViewStudent from './pages/ViewStudent';
import Projects from './pages/Projects';
import ViewProject from './pages/ViewProject';
import AddProject from './pages/AddProject';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Notices from './pages/Notices';
import PostNotice from './pages/PostNotice';
import Resources from './pages/Resources';
import PostResource from './pages/PostResource';
import Leaderboard from './pages/Leaderboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Search from './pages/Search';

import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}