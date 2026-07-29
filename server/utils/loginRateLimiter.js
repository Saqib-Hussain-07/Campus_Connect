const LoginAttempt = require('../models/LoginAttempt');

/**
 * Tiered Login Lockout Strategy:
 * - Tier 1: 5 failed attempts -> 5-minute lockout.
 * - Tier 2: 3 more failed attempts (total 8) -> 7-minute lockout.
 * - Tier 3: 2 failed attempts per cycle -> 10-minute lockout.
 */

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const checkLoginLockout = async (ip, email) => {
  const normEmail = (email || '').trim().toLowerCase();
  const record = await LoginAttempt.findOne({ ip, email: normEmail });

  if (!record) {
    return { isLocked: false, remainingAttempts: 5 };
  }

  const now = Date.now();

  // If currently locked out
  if (record.lockoutUntil && record.lockoutUntil.getTime() > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil.getTime() - now) / 1000);
    const timeFormatted = formatTime(retryAfterSeconds);
    return {
      isLocked: true,
      retryAfterSeconds,
      lockoutUntil: record.lockoutUntil,
      lockoutMinutes: record.lastLockoutDurationMinutes,
      message: `Too many failed login attempts. Please try again in ${timeFormatted}.`
    };
  }

  // Lockout has passed, check phase
  if (record.lockoutUntil && record.lockoutUntil.getTime() <= now) {
    record.attemptsInCurrentPhase = 0;
    record.lockoutUntil = null;
    await record.save();
  }

  let phaseLimit = 5;
  if (record.failedCount >= 8) {
    phaseLimit = 2;
  } else if (record.failedCount >= 5) {
    phaseLimit = 3;
  }

  const remainingAttempts = Math.max(0, phaseLimit - record.attemptsInCurrentPhase);
  return { isLocked: false, remainingAttempts, record };
};

const recordFailedAttempt = async (ip, email) => {
  const normEmail = (email || '').trim().toLowerCase();
  let record = await LoginAttempt.findOne({ ip, email: normEmail });

  if (!record) {
    record = new LoginAttempt({ ip, email: normEmail });
  }

  const now = Date.now();
  if (record.lockoutUntil && record.lockoutUntil.getTime() <= now) {
    record.attemptsInCurrentPhase = 0;
    record.lockoutUntil = null;
  }

  record.failedCount += 1;
  record.attemptsInCurrentPhase += 1;
  record.updatedAt = new Date();

  let isLocked = false;
  let lockoutMinutes = 0;

  if (record.failedCount <= 5) {
    // Tier 1: 5 failed attempts -> 5 minutes lockout
    if (record.attemptsInCurrentPhase >= 5) {
      isLocked = true;
      lockoutMinutes = 5;
    }
  } else if (record.failedCount <= 8) {
    // Tier 2: 3 failed attempts after 5m break -> 7 minutes lockout
    if (record.attemptsInCurrentPhase >= 3) {
      isLocked = true;
      lockoutMinutes = 7;
    }
  } else {
    // Tier 3: 2 failed attempts after subsequent breaks -> 10 minutes lockout
    if (record.attemptsInCurrentPhase >= 2) {
      isLocked = true;
      lockoutMinutes = 10;
    }
  }

  if (isLocked) {
    const lockoutUntil = new Date(now + lockoutMinutes * 60 * 1000);
    record.lockoutUntil = lockoutUntil;
    record.lastLockoutDurationMinutes = lockoutMinutes;
    await record.save();

    const retryAfterSeconds = lockoutMinutes * 60;
    const timeFormatted = formatTime(retryAfterSeconds);

    let thresholdText = record.failedCount <= 5
      ? '5 failed attempts'
      : record.failedCount <= 8
      ? '3 failed attempts'
      : '2 failed attempts';

    return {
      isLocked: true,
      retryAfterSeconds,
      lockoutUntil,
      lockoutMinutes,
      message: `Too many failed login attempts (${thresholdText}). Locked out for ${lockoutMinutes} minutes (${timeFormatted}).`
    };
  }

  await record.save();

  let phaseLimit = record.failedCount >= 8 ? 2 : record.failedCount >= 5 ? 3 : 5;
  const remainingAttempts = Math.max(0, phaseLimit - record.attemptsInCurrentPhase);

  let lockDurationNext = record.failedCount >= 8 ? 10 : record.failedCount >= 5 ? 7 : 5;

  return {
    isLocked: false,
    remainingAttempts,
    message: `Invalid credentials. ${remainingAttempts} attempt(s) remaining before a ${lockDurationNext}-minute break.`
  };
};

const clearLoginAttempt = async (ip, email) => {
  const normEmail = (email || '').trim().toLowerCase();
  await LoginAttempt.deleteOne({ ip, email: normEmail });
};

module.exports = {
  checkLoginLockout,
  recordFailedAttempt,
  clearLoginAttempt,
  formatTime
};
