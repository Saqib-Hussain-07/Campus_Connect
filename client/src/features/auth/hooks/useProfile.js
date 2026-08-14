import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export function useProfile(courseMeta = {}) {
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
    avatar: 'default.jpg'
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

    authService.getMe()
      .then((u) => {
        const meta = courseMeta[u.department] || { group: '', sem: 0, label: '' };
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
  }, [token, navigate, courseMeta]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);

    try {
      const data = await authService.updateUserProfile({
        name: form.name,
        department: form.department,
        semester: Number(form.semester),
        university: form.university,
        skills: form.skills,
        bio: form.bio,
        avatar: form.avatar && form.avatar.startsWith('data:') ? form.avatar : undefined
      });

      setSuccess('Profile updated successfully!');
      if (data && data.data) {
        updateUser(data.data);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    saving,
    success,
    error,
    handleChange,
    handleDeptGroupChange,
    handleCourseChange,
    handleAvatarChange,
    handleSubmit
  };
}
