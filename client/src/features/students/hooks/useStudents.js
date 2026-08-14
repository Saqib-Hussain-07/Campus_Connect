import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/studentService';

export function useStudents() {
  const token = localStorage.getItem('campusconnect_token');

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async (overrideParams = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const activeSearch = overrideParams && 'search' in overrideParams ? overrideParams.search : search;
      const activeDept = overrideParams && 'department' in overrideParams ? overrideParams.department : department;
      const activeUniv = overrideParams && 'university' in overrideParams ? overrideParams.university : university;
      const activeSem = overrideParams && 'semester' in overrideParams ? overrideParams.semester : semester;
      const activeSkill = overrideParams && 'skill' in overrideParams ? overrideParams.skill : skill;

      if (activeSearch) params.search = activeSearch;
      if (activeDept) params.department = activeDept;
      if (activeUniv) params.university = activeUniv;
      if (activeSem) params.semester = activeSem;
      if (activeSkill) params.skill = activeSkill;

      const data = await studentService.getStudents(params);
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, department, university, semester, skill]);

  useEffect(() => {
    fetchStudents();
  }, [department, semester]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchStudents();
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    setUniversity('');
    setSemester('');
    setSkill('');
    fetchStudents({
      search: '',
      department: '',
      university: '',
      semester: '',
      skill: ''
    });
  };

  const handleConnect = async (studentId) => {
    if (!token) return;
    try {
      await studentService.connectStudent(studentId);
      fetchStudents();
    } catch (err) {
      console.error('Connect failed:', err);
    }
  };

  return {
    students,
    loading,
    error,
    search,
    setSearch,
    department,
    setDepartment,
    university,
    setUniversity,
    semester,
    setSemester,
    skill,
    setSkill,
    fetchStudents,
    handleSearchSubmit,
    handleReset,
    handleConnect,
    token
  };
}
