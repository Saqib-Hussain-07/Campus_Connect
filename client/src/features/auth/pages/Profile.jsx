import React from 'react';
import Loader from '../../../components/Loader';
import { COURSE_META } from '../constants/departments';
import { useProfile } from '../hooks/useProfile';
import ProfileHeader from '../components/ProfileHeader';
import ProfilePreviewCard from '../components/ProfilePreviewCard';
import ProfileForm from '../components/ProfileForm';

export default function Profile() {
  const {
    form,
    loading,
    saving,
    success,
    error,
    handleChange,
    handleDeptGroupChange,
    handleCourseChange,
    handleAvatarChange,
    handleSubmit
  } = useProfile(COURSE_META);

  if (loading) return <Loader message="Loading Profile Settings..." />;

  return (
    <div className="row g-0">
      <div className="col-12 cc-dash-content">
        <ProfileHeader />
        <div className="row g-4">
          {/* Left Profile Card Preview */}
          <div className="col-lg-3">
            <ProfilePreviewCard form={form} />
          </div>

          {/* Edit form */}
          <div className="col-lg-9">
            <ProfileForm
              form={form}
              saving={saving}
              error={error}
              success={success}
              handleChange={handleChange}
              handleDeptGroupChange={handleDeptGroupChange}
              handleCourseChange={handleCourseChange}
              handleAvatarChange={handleAvatarChange}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
