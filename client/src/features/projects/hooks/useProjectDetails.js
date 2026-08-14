import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';

export function useProjectDetails(projectId) {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');

  const [project, setProject] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (err) {
      setError(err.message || 'Project not found');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleLike = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await projectService.likeProject(projectId);
      fetchProjectDetails();
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || !token) return;

    try {
      await projectService.commentProject(projectId, commentText.trim());
      setCommentText('');
      fetchProjectDetails();
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleJoinRequestSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!token) return;
    setRequestSuccess('');

    try {
      await projectService.submitJoinRequest(projectId, requestText);
      setRequestText('');
      setRequestSuccess('Your team join request has been sent!');
      fetchProjectDetails();
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const handleModerateRequest = async (reqId, action) => {
    try {
      await projectService.moderateJoinRequest(projectId, reqId, action);
      fetchProjectDetails();
    } catch (err) {
      console.error('Moderation failed:', err);
    }
  };

  return {
    project,
    loading,
    error,
    commentText,
    setCommentText,
    requestText,
    setRequestText,
    requestSuccess,
    fetchProjectDetails,
    handleLike,
    handleCommentSubmit,
    handleJoinRequestSubmit,
    handleModerateRequest
  };
}
