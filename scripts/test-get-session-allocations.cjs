const sessionController = require('../backend/controllers/session.controller.js');

// Mock request and response objects
const mockReq = {
  user: {
    institutionId: '12345678-1234-1234-1234-123456789012' // From our debug output
  }
};

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log(`Response Status: ${this.statusCode || 200}`);
    console.log('Response Data:', JSON.stringify(data, null, 2));
  }
};

console.log('Testing getSessionAllocations function directly...');
sessionController.getSessionAllocations(mockReq, mockRes);