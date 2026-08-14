import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';

export function useStudentDetails(id) {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');

  const [studentData, setStudentData] = useState(null);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentDetails = useCallback(async () => {
    if (!id) return;
    try {
      const data = await studentService.getStudentById(id);
      setStudentData(data);

      if (token && loggedInUser && loggedInUser.id !== id) {
        const connData = await studentService.getConnectionStatus(id);
        setConnection(connData);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Student not found');
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const handleConnect = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await studentService.connectStudent(id);
      fetchStudentDetails();
    } catch (err) {
      console.error('Connect failed:', err);
    }
  };

  const handleEndorse = async (skill) => {
    if (!token) return;
    try {
      await studentService.endorseSkill(id, skill);
      fetchStudentDetails();
    } catch (err) {
      console.error('Endorse failed:', err);
    }
  };

  const handleRespond = async (action) => {
    if (!connection || !connection.connectionId) return;
    try {
      await studentService.respondConnection(connection.connectionId, action);
      fetchStudentDetails();
    } catch (err) {
      console.error('Respond failed:', err);
    }
  };

  return {
    studentData,
    connection,
    loading,
    error,
    loggedInUser,
    token,
    fetchStudentDetails,
    handleConnect,
    handleEndorse,
    handleRespond
  };
}
