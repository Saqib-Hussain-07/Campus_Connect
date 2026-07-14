import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    departmentGroup: '',
    department: '', // course name
    semester: '',
    university: '',
    skills: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const errs = {};
    if (form.name.length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.departmentGroup) errs.deptGroup = 'Please select a department category.';
    if (!form.department) errs.department = 'Please select a course.';
    if (!form.semester) errs.semester = 'Please select your current semester.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrs = validateForm();
    if (Object.keys(validationErrs).length > 0) {
      setErrors(validationErrs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department,
          semester: Number(form.semester),
          university: form.university,
          skills: form.skills,
          bio: form.bio,
          password: form.password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('campusconnect_token', data.token);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedCourses = DEPT_COURSES[form.departmentGroup] || [];
  const selectedCourseMeta = selectedCourses.find((c) => c.name === form.department);
  const totalSemesters = selectedCourseMeta ? selectedCourseMeta.sem : 0;

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0" style={{ minHeight: 'calc(100vh - 92px)' }}>
          {/* Left panel */}
          <div className="col-lg-5 cc-auth-left d-none d-lg-flex" style={{ background: 'var(--ink)', padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div className="text-center">
              <div className="cc-brand-mark mx-auto mb-4" style={{ width: '56px', height: '56px' }}>
                <i className="fas fa-graduation-cap" style={{ fontSize: '20px', color: 'var(--paper)' }}></i>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--paper)', lineHeight: '.9', letterSpacing: '.02em' }}>
                Start Your<br /><span style={{ color: 'var(--rust)' }}>Journey</span>
              </h2>
              <p className="mt-4" style={{ color: 'rgba(255,255,255,.4)', maxWidth: '280px', fontSize: '.9rem', lineHeight: '1.6', margin: '0 auto' }}>
                Join 25,000+ verified students finding study partners, building projects, and growing their network.
              </p>
              <div className="mt-5 d-flex flex-column gap-3 align-items-center">
                {['Verified university accounts only', 'End-to-end encrypted messages', 'Free forever for students'].map((f, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 text-start" style={{ color: 'rgba(255,255,255,.55)', fontSize: '.84rem', width: '220px' }}>
                    <i className="fas fa-check-circle" style={{ color: 'var(--rust)' }}></i>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-lg-7 cc-auth-right" style={{ background: 'var(--cream)', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="cc-auth-form-card" style={{ maxWidth: '580px', width: '100%', background: 'var(--white)', padding: '36px', border: '1.5px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)' }}>
              <h1 className="cc-auth-heading mb-1" style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Create Account</h1>
              <p className="mb-4" style={{ fontSize: '.88rem', color: '#888' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--rust)', fontWeight: '700' }}>Login</Link>
              </p>

              {errors.server && (
                <div className="alert alert-danger p-3 mb-3" style={{ borderRadius: '0', fontSize: '.8rem' }}>
                  <i className="fas fa-triangle-exclamation me-2"></i>
                  {errors.server}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <label className="cc-form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      required
                    />
                    {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                  </div>

                  {/* University Email */}
                  <div className="col-12">
                    <label className="cc-form-label">University Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="you@university.edu"
                      required
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                  </div>

                  {/* Department Group */}
                  <div className="col-12">
                    <label className="cc-form-label">
                      Department *
                      <span style={{ fontSize: '.58rem', color: '#bbb', fontFamily: 'var(--font-mono)', fontWeight: '400', marginLeft: '4px' }}>
                        ① Choose category
                      </span>
                    </label>
                    <select
                      value={form.departmentGroup}
                      onChange={handleDeptGroupChange}
                      className={`cc-form-input ${errors.deptGroup ? 'is-invalid' : ''}`}
                    >
                      <option value="">— Select Department —</option>
                      {Object.keys(DEPT_COURSES).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.deptGroup && <div className="invalid-feedback d-block">{errors.deptGroup}</div>}
                  </div>

                  {/* Course */}
                  <div className="col-8">
                    <label className="cc-form-label">
                      Course / Programme *
                      <span style={{ fontSize: '.58rem', color: '#bbb', fontFamily: 'var(--font-mono)', fontWeight: '400', marginLeft: '4px' }}>
                        ② Pick course
                      </span>
                    </label>
                    <select
                      value={form.department}
                      onChange={handleCourseChange}
                      className={`cc-form-input ${errors.department ? 'is-invalid' : ''}`}
                      disabled={!form.departmentGroup}
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
                    {errors.department && <div className="invalid-feedback d-block">{errors.department}</div>}
                  </div>

                  {/* Semester */}
                  <div className="col-4">
                    <label className="cc-form-label">
                      Semester *
                      <span style={{ fontSize: '.58rem', color: '#bbb', fontFamily: 'var(--font-mono)', fontWeight: '400', marginLeft: '4px' }}>
                        ③ Auto-set
                      </span>
                    </label>
                    <select
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.semester ? 'is-invalid' : ''}`}
                      disabled={!form.department}
                    >
                      <option value="">—</option>
                      {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    {errors.semester && <div className="invalid-feedback d-block">{errors.semester}</div>}
                    {selectedCourseMeta && (
                      <div id="regCourseInfo" style={{ fontSize: '.64rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        📚 {selectedCourseMeta.label}
                      </div>
                    )}
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
                      placeholder="e.g. Python, React, MATLAB, Figma"
                    />
                  </div>

                  {/* Bio */}
                  <div className="col-12">
                    <label className="cc-form-label">Short Bio</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows="2"
                      className="cc-form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Tell others what you're working on or looking for..."
                    />
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="cc-form-label">Password * <span style={{ fontSize: '.65rem', color: '#aaa' }}>(min 8 chars)</span></label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-6">
                    <label className="cc-form-label">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />
                    {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                  </div>

                  {/* Submit button */}
                  <div className="col-12 mt-2">
                    <button
                      type="submit"
                      className="cc-btn-fill py-3 w-100"
                      style={{ fontSize: '.84rem', textTransform: 'uppercase', letterSpacing: '.05em', border: 'none' }}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account…' : 'Create Account'} <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
