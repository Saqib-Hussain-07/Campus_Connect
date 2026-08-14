const LoginAttempt = require('../models/LoginAttempt');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Enterprise Multi-Layer Brute-Force & Account Lockout Mitigation Strategy:
 * 1. IP + Email Layer (Protects against targeted single-host brute force)
 *    - Tier 1: 5 failed attempts  -> 5-minute lockout
 *    - Tier 2: +3 failed attempts -> 7-minute lockout
 *    - Tier 3: +2 failed attempts -> 10-minute lockout
 * 2. User Account Layer (Protects against distributed credential stuffing across proxy botnets)
 *    - 5 cumulative failures -> 15-minute account lock
 */

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const checkLoginLockout = async (ip, email) => {
  const normEmail = (email || '').trim().toLowerCase();
  const now = Date.now();

  // 1. Check User Account-Level Lockout (Distributed attack prevention)
  if (normEmail) {
    const user = await User.findOne({ email: normEmail }).select('+lockoutUntil +failedLoginAttempts');
    if (user && user.lockoutUntil && user.lockoutUntil.getTime() > now) {
      const retryAfterSeconds = Math.ceil((user.lockoutUntil.getTime() - now) / 1000);
      const timeFormatted = formatTime(retryAfterSeconds);
      return {
        isLocked: true,
        code: 'ACCOUNT_LOCKED',
        retryAfterSeconds,
        lockoutUntil: user.lockoutUntil,
        lockoutMinutes: Math.ceil(retryAfterSeconds / 60),
        message: `Account temporarily locked due to excessive failed attempts. Please try again in ${timeFormatted}.`
      };
    }
  }

  // 2. Check IP + Email Tiered Lockout
  const record = await LoginAttempt.findOne({ ip, email: normEmail });
  if (!record) {
    return { isLocked: false, remainingAttempts: 5 };
  }

  if (record.lockoutUntil && record.lockoutUntil.getTime() > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil.getTime() - now) / 1000);
    const timeFormatted = formatTime(retryAfterSeconds);
    return {
      isLocked: true,
      code: 'ACCOUNT_LOCKED',
      retryAfterSeconds,
      lockoutUntil: record.lockoutUntil,
      lockoutMinutes: record.lastLockoutDurationMinutes,
      message: `Too many failed login attempts from this network. Please try again in ${timeFormatted}.`
    };
  }

  // Lockout duration has expired, reset current phase
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
  const now = Date.now();

  // 1. Update Account-Level Counter if user exists
  if (normEmail) {
    const user = await User.findOne({ email: normEmail });
    if (user) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();

      if (user.failedLoginAttempts >= 5) {
        const lockoutMinutes = 15;
        user.lockoutUntil = new Date(now + lockoutMinutes * 60 * 1000);
        await user.save();

        logger.warn(`Security alert: Account ${normEmail} locked for 15 minutes due to 5 failed attempts.`);

        const retryAfterSeconds = lockoutMinutes * 60;
        return {
          isLocked: true,
          code: 'ACCOUNT_LOCKED',
          retryAfterSeconds,
          lockoutUntil: user.lockoutUntil,
          lockoutMinutes,
          message: `Account has been locked for 15 minutes due to multiple failed login attempts (${formatTime(retryAfterSeconds)}).`
        };
      }
      await user.save();
    }
  }

  // 2. Update IP + Email Attempt Record
  let record = await LoginAttempt.findOne({ ip, email: normEmail });
  if (!record) {
    record = new LoginAttempt({ ip, email: normEmail });
  }

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
    if (record.attemptsInCurrentPhase >= 5) {
      isLocked = true;
      lockoutMinutes = 5;
    }
  } else if (record.failedCount <= 8) {
    if (record.attemptsInCurrentPhase >= 3) {
      isLocked = true;
      lockoutMinutes = 7;
    }
  } else {
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

    logger.warn(`Security alert: IP ${ip} / Email ${normEmail} locked out for ${lockoutMinutes} minutes.`);

    const retryAfterSeconds = lockoutMinutes * 60;
    const timeFormatted = formatTime(retryAfterSeconds);

    let thresholdText = record.failedCount <= 5
      ? '5 failed attempts'
      : record.failedCount <= 8
      ? '3 failed attempts'
      : '2 failed attempts';

    return {
      isLocked: true,
      code: 'ACCOUNT_LOCKED',
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
    code: 'INVALID_CREDENTIALS',
    remainingAttempts,
    message: `Invalid credentials. ${remainingAttempts} attempt(s) remaining before a ${lockDurationNext}-minute break.`
  };
};

const clearLoginAttempt = async (ip, email) => {
  const normEmail = (email || '').trim().toLowerCase();
  await Promise.all([
    LoginAttempt.deleteOne({ ip, email: normEmail }),
    User.updateOne(
      { email: normEmail },
      { $set: { failedLoginAttempts: 0, lockoutUntil: null } }
    )
  ]);
};

module.exports = {
  checkLoginLockout,
  recordFailedAttempt,
  clearLoginAttempt,
  formatTime
};
