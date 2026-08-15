const { formatTime } = require('../../utils/loginRateLimiter');

describe('Unit Test: Login Lockout Formatter', () => {
  it('should format seconds into mm:ss strings accurately', () => {
    expect(formatTime(300)).toBe('05:00');
    expect(formatTime(420)).toBe('07:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(9)).toBe('00:09');
  });
});
