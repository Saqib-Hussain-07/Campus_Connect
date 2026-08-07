import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import { getAvatarUrl } from '../utils/avatar';
import { useAuth } from '../context/AuthContext';

const DEPT_COURSES = {
  'Computer Science Engineering': [
    { name: 'Computer Science', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'CSE – Artificial Intelligence', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'CSE – Data Science', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'CSE – Cybersecurity', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'CSE – Cloud Computing', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'CSE – IoT', sem: 8, label: 'B.Tech · 8 Semesters' },
  ],
  'Mechanical Engineering': [
    { name: 'Mechanical Engineering', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Mechanical – Robotics & Automation', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Mechanical – Automobile', sem: 8, label: 'B.E. · 8 Semesters' },
  ],
  'Electrical Engineering': [
    { name: 'Electrical Engineering', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Electrical & Electronics (EEE)', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Electrical – Power Systems', sem: 8, label: 'B.E. · 8 Semesters' },
  ],
  'Civil Engineering': [
    { name: 'Civil Engineering', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Civil – Construction Management', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Civil – Environmental Engineering', sem: 8, label: 'B.E. · 8 Semesters' },
  ],
  'Information Technology': [
    { name: 'Information Technology', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'IT – Cloud & DevOps', sem: 8, label: 'B.Tech · 8 Semesters' },
    { name: 'IT – IoT & Embedded Systems', sem: 8, label: 'B.Tech · 8 Semesters' },
  ],
  'Electronics': [
    { name: 'Electronics & Communication', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Electronics – VLSI Design', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Electronics – Embedded Systems', sem: 8, label: 'B.E. · 8 Semesters' },
  ],
  'Chemical Engineering': [
    { name: 'Chemical Engineering', sem: 8, label: 'B.E. · 8 Semesters' },
    { name: 'Chemical – Petrochemical', sem: 8, label: 'B.E. · 8 Semesters' },
  ],
  'Data Science': [
    { name: 'Data Science', sem: 6, label: 'B.Sc. · 6 Semesters' },
    { name: 'Data Science & Analytics', sem: 6, label: 'B.Sc. · 6 Semesters' },
    { name: 'Statistics & Data Science', sem: 6, label: 'B.Sc. · 6 Semesters' },
  ],
  'Business Administration': [
    { name: 'Business Administration', sem: 6, label: 'BBA · 6 Semesters' },
    { name: 'BBA – Finance', sem: 6, label: 'BBA · 6 Semesters' },
    { name: 'BBA – Marketing', sem: 6, label: 'BBA · 6 Semesters' },
    { name: 'BBA – Human Resources', sem: 6, label: 'BBA · 6 Semesters' },
    { name: 'MBA', sem: 4, label: 'MBA · 4 Semesters (2 Yrs)' },
    { name: 'MBA – Finance', sem: 4, label: 'MBA · 4 Semesters (2 Yrs)' },
    { name: 'MBA – Marketing', sem: 4, label: 'MBA · 4 Semesters (2 Yrs)' },
    { name: 'MBA – Business Analytics', sem: 4, label: 'MBA · 4 Semesters (2 Yrs)' },
  ],
  'UX & Design': [
    { name: 'UX Design', sem: 8, label: 'B.Des · 8 Semesters' },
    { name: 'UX – Interaction Design', sem: 8, label: 'B.Des · 8 Semesters' },
    { name: 'UX – Product Design', sem: 8, label: 'B.Des · 8 Semesters' },
  ],
  'MCA (Postgraduate)': [
    { name: 'MCA', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
    { name: 'MCA – Artificial Intelligence', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
    { name: 'MCA – Data Science & Analytics', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
    { name: 'MCA – Cloud Computing', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
    { name: 'MCA – Cybersecurity', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
    { name: 'MCA – Software Engineering', sem: 4, label: 'MCA · 4 Semesters (2 Yrs)' },
  ],
};

// Build reverse map course -> group
const COURSE_META = {};
for (const [grp, courses] of Object.entries(DEPT_COURSES)) {
  for (const c of courses) {
    COURSE_META[c.name] = { group: grp, sem: c.sem, label: c.label };
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const token = localStorage.getItem('campusconnect_token');

  const [form, setForm] = useState({
    name: '',
    departmentGroup: '',
    department: '',
    semester: '',
    university: '',
    skills: '',
    bio: '',
    avatar: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((u) => {
        const meta = COURSE_META[u.department] || { group: '', sem: 0, label: '' };
        setForm({
          name: u.name || '',
          departmentGroup: meta.group || '',
          department: u.department || '',
          semester: u.semester || '',
          university: u.university || '',
          skills: u.skills ? u.skills.join(', ') : '',
          bio: u.bio || '',
          avatar: u.avatar || 'default.jpg'
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, navigate]);

  const handleDeptGroupChange = (e) => {
    const group = e.target.value;
    setForm((prev) => ({
      ...prev,
      departmentGroup: group,
      department: '',
      semester: ''
    }));
  };

  const handleCourseChange = (e) => {
    const course = e.target.value;
    setForm((prev) => ({
      ...prev,
      department: course,
      semester: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          department: form.department,
          semester: Number(form.semester),
          university: form.university,
          skills: form.skills,
          bio: form.bio,
          avatar: form.avatar.startsWith('data:') ? form.avatar : undefined // only submit updated base64
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setSuccess('Profile updated successfully!');
      if (data.data) {
        updateUser(data.data);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading Profile Settings..." />;

  const selectedCourses = DEPT_COURSES[form.departmentGroup] || [];
  const selectedCourseMeta = selectedCourses.find((c) => c.name === form.department);
  const totalSemesters = selectedCourseMeta ? selectedCourseMeta.sem : 0;

  const avatarUrl = () => getAvatarUrl(form.avatar, form.name);

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className="row g-4">
              {/* Left Profile Card Preview */}
              <div className="col-lg-3">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', textAlign: 'center' }}>
                  <div className="position-relative d-inline-block mb-3">
                    <img
                      src={avatarUrl()}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid var(--ink)' }}
                      alt={form.name}
                    />
                    <span style={{ position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--white)' }}></span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>
                    {form.name}
                  </h4>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
                    {form.department || 'No course set'}
                  </div>
                  {form.university && (
                    <div style={{ fontSize: '.78rem', color: '#888', marginBottom: '12px' }}>
                      <i className="fas fa-university me-1" style={{ color: 'var(--rust)' }}></i>{form.university}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--moss)', marginBottom: '16px' }}>
                    <i className="fas fa-check-circle me-1"></i>Verified Account
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <div className="col-lg-9">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Edit Information</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Update Profile</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-3 mb-4">{success}</div>}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-12">
                        <label className="cc-form-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        />
                      </div>

                      {/* Avatar */}
                      <div className="col-12">
                        <label className="cc-form-label">Profile Avatar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="cc-form-input"
                          style={{ padding: '8px' }}
                        />
                      </div>

                      {/* Department category */}
                      <div className="col-12">
                        <label className="cc-form-label">Department *</label>
                        <select
                          value={form.departmentGroup}
                          onChange={handleDeptGroupChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="">— Select Department —</option>
                          {Object.keys(DEPT_COURSES).map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Course */}
                      <div className="col-8">
                        <label className="cc-form-label">Course / Programme *</label>
                        <select
                          value={form.department}
                          onChange={handleCourseChange}
                          className="cc-form-input"
                          disabled={!form.departmentGroup}
                          required
                        >
                          <option value="">
                            {form.departmentGroup ? '— Select course / programme —' : '— Select department first —'}
                          </option>
                          {selectedCourses.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Semester */}
                      <div className="col-4">
                        <label className="cc-form-label">Semester *</label>
                        <select
                          name="semester"
                          value={form.semester}
                          onChange={handleChange}
                          className="cc-form-input"
                          disabled={!form.department}
                          required
                        >
                          <option value="">—</option>
                          {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
                            <option key={sem} value={sem}>
                              Semester {sem}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* University */}
                      <div className="col-12">
                        <label className="cc-form-label">University / College</label>
                        <input
                          type="text"
                          name="university"
                          value={form.university}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. IIT Mumbai"
                        />
                      </div>

                      {/* Skills */}
                      <div className="col-12">
                        <label className="cc-form-label">Skills (comma-separated)</label>
                        <input
                          type="text"
                          name="skills"
                          value={form.skills}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. Python, React, AutoCAD"
                        />
                      </div>

                      {/* Bio */}
                      <div className="col-12">
                        <label className="cc-form-label">Bio / Interests</label>
                        <textarea
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          rows="4"
                          className="cc-form-input"
                          placeholder="Introduce yourself to the campus..."
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={saving}>
                          {saving ? 'Saving changes…' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
