import React from 'react';
import { DEPT_COURSES } from '../constants/departments';

export default function ProfileForm({
  form,
  saving,
  error,
  success,
  handleChange,
  handleDeptGroupChange,
  handleCourseChange,
  handleAvatarChange,
  handleSubmit
}) {
  const selectedCourses = DEPT_COURSES[form.departmentGroup] || [];
  const selectedCourseMeta = selectedCourses.find((c) => c.name === form.department);
  const totalSemesters = selectedCourseMeta ? selectedCourseMeta.sem : 0;

  return (
    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px' }}>
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
  );
}
