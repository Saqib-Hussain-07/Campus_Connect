const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEFAULT_ALLOWED_ORIGINS = [
  'https://campus-connect-sigma-six.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const validateEnv = () => {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `CRITICAL CONFIGURATION ERROR: Missing required environment variable(s): ${missing.join(', ')}`;
    console.error('====================================================');
    console.error(errorMsg);
    console.error('The server cannot start without JWT_SECRET defined.');
    console.error('====================================================');
    process.exit(1);
  }

  // Ensure default MONGO_URI fallback if not provided
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/campusconnect';
  }

  // Define default allowed origins for CORS
  if (!process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS = DEFAULT_ALLOWED_ORIGINS.join(',');
  }
};

module.exports = { validateEnv, DEFAULT_ALLOWED_ORIGINS };
