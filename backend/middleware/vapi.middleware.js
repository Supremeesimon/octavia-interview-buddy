const verifyVapiSecret = (req, res, next) => {
  const secret = req.headers['x-vapi-secret'];
  
  // Check if secret is present
  if (!secret) {
    return res.status(401).json({ 
      success: false, 
      message: 'Missing authentication secret' 
    });
  }

  // Check if secret matches environment variable
  // Note: VAPI_SECRET_TOKEN should be set in .env
  if (secret !== process.env.VAPI_SECRET_TOKEN) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid authentication secret' 
    });
  }

  next();
};

module.exports = { verifyVapiSecret };
