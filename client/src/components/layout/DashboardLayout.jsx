import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import BottomNav from './BottomNav';

export default function DashboardLayout() {
  return (
    <div className="cc-dashboard-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="cc-dashboard-main-content flex-grow-1" style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <Outlet />
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
