const request = require('supertest');
const { app } = require('../../index');

describe('Integration Test: Health Check Endpoints', () => {
  it('GET /health should return 200 with status, uptime, and version', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /api/general/health should return 200 with matching schema', async () => {
    const res = await request(app).get('/api/general/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });
});
