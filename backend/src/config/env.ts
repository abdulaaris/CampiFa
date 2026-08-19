import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'campifa_jwt_super_secret_default_key_2026',
  sessionSecret: process.env.SESSION_SECRET || 'campifa_session_secret_2026',
  uploadDir: path.resolve(__dirname, '../../../uploads'),
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  isProd: process.env.NODE_ENV === 'production',
};
