import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/apiClient';
import Loader from '../../../components/Loader';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../auth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Reports State
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('pending');

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/reports?status=${reportFilter}`);
      if (res.data?.success) {
        setReports(res.data.data?.reports || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [reportFilter, addToast]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/admin/users?q=${encodeURIComponent(userSearch)}`);
      if (res.data?.success) {
        setUsers(res.data.data?.users || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [userSearch, addToast]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'reports') fetchReports();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchAnalytics, fetchReports, fetchUsers]);

  // Report Resolution
  const handleResolveReport = async (id, status) => {
    try {
      const res = await apiClient.patch(`/api/reports/${id}`, {
        status,
        resolutionNotes: `Report ${status} by administrator`
      });
      if (res.data?.success) {
        addToast(`Report marked as ${status}`, 'success');
        fetchReports();
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  // User Ban Toggle
  const handleToggleBan = async (userId, currentBanned) => {
    const isBanning = !currentBanned;
    const reason = isBanning
      ? window.prompt('Enter reason for banning user:', 'Violation of campus community guidelines')
      : null;

    if (isBanning && reason === null) return; // User cancelled prompt

    try {
      const res = await apiClient.post(`/api/admin/users/${userId}/ban`, {
        ban: isBanning,
        reason
      });
      if (res.data?.success) {
        addToast(isBanning ? 'User banned successfully' : 'User unbanned', 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update ban status', 'error');
    }
  };

  // Content Removal
  const handleDeleteContent = async (type, id) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await apiClient.delete(`/api/admin/content/${type.toLowerCase()}/${id}`);
      if (res.data?.success) {
        addToast(`${type} removed by moderation action`, 'success');
        if (activeTab === 'reports') fetchReports();
      }
    } catch (err) {
      addToast(err.message || 'Failed to remove content', 'error');
    }
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: 'calc(100vh - 92px)', padding: '32px 0 60px' }}>
      <div className="container">
        {/* Admin Header */}
        <div
          style={{
            background: 'var(--ink)',
            padding: '32px 40px',
            color: '#fff',
            marginBottom: '24px',
            boxShadow: '4px 4px 0 var(--rust)'
          }}
        >
          <div className="cc-section-label white-lbl">Admin Control Center</div>
          <h1 className="cc-heading on-dark" style={{ fontSize: '2.4rem', margin: '6px 0 8px' }}>
            CAMPUS MODERATION &amp; ANALYTICS
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', margin: 0, fontSize: '.9rem' }}>
            Logged in as <strong>{user?.name}</strong> (Administrator)
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex gap-2 mb-4">
          {[
            { id: 'analytics', label: '📊 Campus Analytics', icon: 'fa-chart-line' },
            { id: 'reports', label: '🚩 Report Triage', icon: 'fa-flag' },
            { id: 'users', label: '👥 User Management & Bans', icon: 'fa-users-gear' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="cc-btn"
              style={{
                padding: '10px 20px',
                fontSize: '.82rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                background: activeTab === tab.id ? 'var(--ink)' : 'var(--white)',
                color: activeTab === tab.id ? 'var(--paper)' : 'var(--ink)',
                border: '2px solid var(--ink)',
                boxShadow: activeTab === tab.id ? '3px 3px 0 var(--rust)' : '3px 3px 0 var(--ink)',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {loading ? (
              <Loader message="Aggregating platform metrics..." />
            ) : analytics ? (
              <div>
                {/* Metric Cards Row */}
                <div className="row g-3 mb-4">
                  {[
                    { label: 'Total Registered Students', value: analytics.metrics.users.total, sub: `${analytics.metrics.users.new7d} in last 7 days`, color: 'var(--moss)' },
                    { label: 'Active Online Now', value: analytics.metrics.users.active, sub: 'Real-time presence', color: 'var(--sky)' },
                    { label: 'Total Projects & Builds', value: analytics.metrics.engagement.projects, sub: 'Campus showcases', color: 'var(--rust)' },
                    { label: 'Events & RSVPs', value: `${analytics.metrics.engagement.events} / ${analytics.metrics.engagement.rsvps}`, sub: 'Events / Attendees', color: 'var(--gold)' },
                    { label: 'Study Circles & Clubs', value: analytics.metrics.engagement.groups, sub: 'Collaborative circles', color: 'var(--sky)' },
                    { label: 'Academic Resources', value: analytics.metrics.engagement.resources, sub: 'Materials uploaded', color: 'var(--moss)' },
                    { label: 'Direct Messages Sent', value: analytics.metrics.engagement.messages, sub: 'Peer interactions', color: 'var(--rust)' },
                    { label: 'Pending User Reports', value: analytics.metrics.moderation.pendingReports, sub: 'Requires moderation', color: analytics.metrics.moderation.pendingReports > 0 ? '#ef4444' : '#10b981' }
                  ].map((card, idx) => (
                    <div key={idx} className="col-xl-3 col-sm-6">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '20px',
                          boxShadow: '3px 3px 0 var(--ink)'
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: '#555', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          {card.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: card.color, margin: '4px 0', lineHeight: 1 }}>
                          {card.value}
                        </div>
                        <div style={{ fontSize: '.72rem', color: '#888' }}>{card.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Breakdown Table */}
                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '24px',
                    boxShadow: '3px 3px 0 var(--ink)'
                  }}
                >
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px' }}>
                    Projects by Category Breakdown
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-bordered m-0" style={{ borderColor: 'var(--ink)' }}>
                      <thead style={{ background: 'var(--ink)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}>
                        <tr>
                          <th>Category</th>
                          <th>Project Count</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontFamily: 'var(--font-body)', fontSize: '.88rem' }}>
                        {analytics.trends.projectsByCategory?.map((item) => (
                          <tr key={item._id}>
                            <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{item._id || 'General'}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. Reports Triage Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="d-flex gap-2 mb-3">
              {['pending', 'resolved', 'dismissed', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilter(st)}
                  className="cc-btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: '.75rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    background: reportFilter === st ? 'var(--rust)' : 'var(--white)',
                    color: reportFilter === st ? '#fff' : 'var(--ink)',
                    border: '1.5px solid var(--ink)'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {loading ? (
              <Loader message="Loading reports..." />
            ) : reports.length === 0 ? (
              <div
                className="text-center py-5"
                style={{
                  background: 'var(--white)',
                  border: '2px solid var(--ink)',
                  padding: '40px',
                  boxShadow: '4px 4px 0 var(--ink)'
                }}
              >
                <i className="fas fa-shield-halved fa-3x mb-3 text-moss"></i>
                <h4>No {reportFilter} reports</h4>
                <p style={{ color: '#4b5563', fontSize: '.9rem' }}>The moderation queue is currently clear.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    style={{
                      border: '2px solid var(--ink)',
                      background: 'var(--white)',
                      padding: '20px',
                      boxShadow: '3px 3px 0 var(--ink)'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span
                          style={{
                            background:
                              rep.status === 'pending'
                                ? '#ef4444'
                                : rep.status === 'resolved'
                                ? '#10b981'
                                : '#6b7280',
                            color: '#fff',
                            fontSize: '.62rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 8px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}
                        >
                          ● {rep.status}
                        </span>
                        <strong className="ms-2" style={{ fontSize: '.9rem' }}>
                          Reported {rep.targetType} (ID: {rep.targetId})
                        </strong>
                      </div>
                      <span style={{ fontSize: '.72rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '.84rem', color: '#111', margin: '8px 0' }}>
                      <strong>Reason:</strong> <span style={{ textTransform: 'capitalize' }}>{rep.reason.replace('_', ' ')}</span>
                      {rep.details && <div style={{ color: '#555', marginTop: '4px' }}>"{rep.details}"</div>}
                    </div>

                    <div style={{ fontSize: '.72rem', color: '#666', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                      Reported by: <strong>{rep.reporter?.name}</strong> ({rep.reporter?.email})
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      {rep.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'resolved')}
                            className="cc-btn-fill"
                            style={{ padding: '6px 14px', fontSize: '.74rem', background: 'var(--moss)', color: '#fff', border: 'none' }}
                          >
                            <i className="fas fa-check me-1"></i> Resolve Report
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'dismissed')}
                            className="cc-btn"
                            style={{ padding: '6px 14px', fontSize: '.74rem', border: '1px solid var(--ink)' }}
                          >
                            <i className="fas fa-xmark me-1"></i> Dismiss
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteContent(rep.targetType, rep.targetId)}
                        className="cc-btn-fill"
                        style={{ padding: '6px 14px', fontSize: '.74rem', background: '#ef4444', color: '#fff', border: 'none' }}
                      >
                        <i className="fas fa-trash-can me-1"></i> Delete Target Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. User Management & Bans Tab */}
        {activeTab === 'users' && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              className="d-flex gap-2 mb-4"
              style={{ maxWidth: '500px' }}
            >
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, department..."
                className="cc-form-input"
                style={{ height: '42px', flex: 1 }}
              />
              <button
                type="submit"
                className="cc-btn-fill px-4"
                style={{ height: '42px', background: 'var(--ink)', color: '#fff', border: 'none' }}
              >
                Search
              </button>
            </form>

            {loading ? (
              <Loader message="Loading users..." />
            ) : (
              <div
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  boxShadow: '3px 3px 0 var(--ink)'
                }}
                className="table-responsive"
              >
                <table className="table table-hover m-0 align-middle">
                  <thead style={{ background: 'var(--ink)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}>
                    <tr>
                      <th>Name &amp; Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: 'var(--font-body)', fontSize: '.85rem' }}>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '.72rem', color: '#666' }}>{u.email}</div>
                        </td>
                        <td>
                          <span style={{ textTransform: 'uppercase', fontSize: '.7rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.department || 'General'}</td>
                        <td>
                          {u.isBanned ? (
                            <span style={{ background: '#ef4444', color: '#fff', fontSize: '.65rem', padding: '2px 6px', fontFamily: 'var(--font-mono)' }}>
                              BANNED
                            </span>
                          ) : (
                            <span style={{ background: '#10b981', color: '#fff', fontSize: '.65rem', padding: '2px 6px', fontFamily: 'var(--font-mono)' }}>
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBan(u._id, u.isBanned)}
                              className="cc-btn"
                              style={{
                                padding: '4px 10px',
                                fontSize: '.72rem',
                                background: u.isBanned ? '#10b981' : '#ef4444',
                                color: '#fff',
                                border: 'none'
                              }}
                            >
                              {u.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
