const { sendSuccess, sendError } = require('../../utils/apiResponse');

describe('Unit Test: Standardized API Response Envelopes', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('sendSuccess should format standard success envelopes correctly', () => {
    const payload = { id: 1, name: 'Alice' };
    sendSuccess(mockRes, payload, 'Operation completed', 200);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: payload,
        message: 'Operation completed'
      })
    );
  });

  it('sendError should format standardized error envelopes with code and details', () => {
    sendError(mockRes, 'User not found', 404, 'USER_NOT_FOUND', { field: 'userId' });

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          details: { field: 'userId' }
        },
        message: 'User not found'
      })
    );
  });
});
