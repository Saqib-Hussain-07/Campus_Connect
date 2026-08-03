const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const {
  checkLoginLockout,
  recordFailedAttempt,
  clearLoginAttempt
} = require('../utils/loginRateLimiter');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules
} = require('../middleware/validators');

const router = express.Router();

// Helper to generate access token (15m expiration)
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Helper to generate refresh token (7d expiration) & save to DB
const generateRefreshToken = async (userId, ipAddress) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
    createdByIp: ipAddress
  });

  return refreshToken.token;
};

// Register
router.post('/register', registerLimiter, registerRules, asyncHandler(async (req, res) => {
  const { name, email, registrationNo, password } = req.body;
  
  const existingEmail = await User.findOne({ email });
  if (existingEmail) return sendError(res, 'Email already registered', 400);

  if (registrationNo) {
    const existingReg = await User.findOne({ registrationNo });
    if (existingReg) return sendError(res, 'Registration number already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    registrationNo,
    password: hashedPassword,
    isVerified: true
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, req.ip);

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15m
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
  });

  return sendSuccess(
    res,
    {
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    },
    'Registration successful',
    201
  );
}));

// Login with progressive rate limiting lockout (5m -> 7m -> 10m)
router.post('/login', authLimiter, loginRules, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  // 1. Check if user/IP is currently locked out
  const lockoutStatus = await checkLoginLockout(ip, email);
  if (lockoutStatus.isLocked) {
    return res.status(429).json({
      success: false,
      message: lockoutStatus.message,
      locked: true,
      retryAfterSeconds: lockoutStatus.retryAfterSeconds,
      lockoutUntil: lockoutStatus.lockoutUntil,
      lockoutMinutes: lockoutStatus.lockoutMinutes
    });
  }

  // 2. Validate credentials
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  let valid = false;
  if (user) {
    valid = await bcrypt.compare(password, user.password);
  }

  // 3. Handle invalid credentials
  if (!user || !valid) {
    const failedResult = await recordFailedAttempt(ip, email);
    if (failedResult.isLocked) {
      return res.status(429).json({
        success: false,
        message: failedResult.message,
        locked: true,
        retryAfterSeconds: failedResult.retryAfterSeconds,
        lockoutUntil: failedResult.lockoutUntil,
        lockoutMinutes: failedResult.lockoutMinutes
      });
    }
    return res.status(400).json({
      success: false,
      message: failedResult.message,
      remainingAttempts: failedResult.remainingAttempts
    });
  }

  // 4. Successful Login: Clear failed attempt record
  await clearLoginAttempt(ip, email);

  // Mark user as online
  user.isOnline = true;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, req.ip);

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15m
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
  });

  return sendSuccess(
    res,
    {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        university: user.university,
        skills: user.skills,
        bio: user.bio,
        avatar: user.avatar
      }
    },
    'Login successful'
  );
}));

// Refresh Token (Token Rotation)
router.post('/refresh', asyncHandler(async (req, res) => {
  const tokenStr = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!tokenStr) return sendError(res, 'Refresh token is required', 400);

  const refreshToken = await RefreshToken.findOne({ token: tokenStr });

  if (!refreshToken || !refreshToken.isActive) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  refreshToken.revokedAt = new Date();
  const newRefreshTokenStr = await generateRefreshToken(refreshToken.user, req.ip);
  refreshToken.replacedByToken = newRefreshTokenStr;
  await refreshToken.save();

  const newAccessToken = generateAccessToken(refreshToken.user);

  res.cookie('token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15m
  });
  res.cookie('refreshToken', newRefreshTokenStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
  });

  return sendSuccess(
    res,
    {
      token: newAccessToken,
      refreshToken: newRefreshTokenStr
    },
    'Token refreshed successfully'
  );
}));

// Get current user details
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, user, 'User details fetched successfully');
}));

// Logout
router.post('/logout', auth, asyncHandler(async (req, res) => {
  const tokenStr = req.cookies?.refreshToken || req.body?.refreshToken;
  
  await User.findByIdAndUpdate(req.user.id, { isOnline: false });

  if (tokenStr) {
    await RefreshToken.findOneAndUpdate(
      { token: tokenStr, user: req.user.id },
      { revokedAt: new Date() }
    );
  }

  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

  return sendSuccess(res, null, 'Logged out successfully');
}));

// Change Password
router.post('/change-password', auth, changePasswordRules, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 'User not found', 404);

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return sendError(res, 'Current password is incorrect', 400);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  return sendSuccess(res, null, 'Password updated successfully');
}));

// Forgot Password
router.post('/forgot-password', forgotPasswordRules, asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  let resetToken = null;
  let resetUrl = null;

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    resetToken = token;
    const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    resetUrl = `${origin}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;

    // Password reset token generated successfully
    // Note: Do not log sensitive reset tokens in application logs
  }

  return sendSuccess(
    res,
    {
      resetToken,
      resetUrl
    },
    'If an account with that email exists, a password reset link has been processed.'
  );
}));

// Reset Password
router.post('/reset-password', resetPasswordRules, asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({
    email: (email || '').toLowerCase(),
    resetToken: token,
    resetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return sendError(res, 'Invalid or expired password reset token', 400);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  return sendSuccess(res, null, 'Password updated successfully');
}));

// Delete Account (With password re-authentication & typed DELETE confirmation)
router.post('/delete-account', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password, confirmText } = req.body;

  if (!password) {
    return sendError(res, 'Password is required to confirm account deletion', 400);
  }

  if (confirmText !== 'DELETE') {
    return sendError(res, 'Please type DELETE to confirm account deletion', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 'Incorrect password. Account deletion aborted.', 400);
  }

  await Project.deleteMany({ userId });
  await Group.deleteMany({ createdBy: userId });
  await Event.deleteMany({ userId });
  await Message.deleteMany({ $or: [{ fromUser: userId }, { toUser: userId }] });
  await Connection.deleteMany({ $or: [{ fromUser: userId }, { toUser: userId }] });
  await RefreshToken.deleteMany({ user: userId });
  await Group.updateMany({ members: userId }, { $pull: { members: userId } });
  await User.findByIdAndDelete(userId);

  return sendSuccess(res, null, 'Account and all associated data deleted successfully.');
}));

module.exports = router;
