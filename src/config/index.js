// const config = require('dotenv')
require('dotenv').config();

process.env.NODE_ENV = 'development'; // process.env.NODE_ENV || 'development'
// if (process.env.NODE_ENV !== 'production') {
//
// }

// const { error } = config();
// if (error) {
//   throw new Error('⚠️  .env file not found  ⚠️');
// }

exports.MONGODB_URI = process.env.MONGODB_URI;
// exports.MONGODB_CONNECT = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
// };

exports.DOMAIN = 'localhost'; // process.env.DOMAIN || 'localhost'
exports.FE_ADDR = 'http://localhost:3000'; // process.env.FE_ADDR || 'http://localhost:3000'
exports.BE_ADDR = 'http://localhost:3100'; // process.env.BE_ADDR || 'http://localhost:3100'

// exports.PORT = parseInt(process.env.PORT) || 3100;
//
// exports.DB_PORT = parseInt(process.env.DB_PORT) || 3306;
// exports.DB_HOST = process.env.DB_HOST || 'localhost';
// exports.DB_SOCKET = process.env.DB_SOCKET || null;
// exports.DB_USER= process.env.DB_USER || 'root';
// exports.DB_PASS= process.env.DB_PASS || 'pass';
// exports.DB_NAME= process.env.DB_NAME || 'nexus';

exports.JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';

exports.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
exports.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

exports.EMAIL_ADDR = process.env.EMAIL_ADDR || '';
exports.EMAIL_NAME = process.env.EMAIL_NAME || '';

exports.ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
exports.ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY || '';
