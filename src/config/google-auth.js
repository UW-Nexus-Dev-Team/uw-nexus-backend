/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { OAuth2Client, Credentials } = require('google-auth-library');

const scope = 'https://mail.google.com';

exports.credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID || '',
  project_id: process.env.GOOGLE_PROJECT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  auth_provider_x509_cert_url: 'https://accounts.google.com/o/oauth2/token',
  client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirect_uris: ['http://localhost'],
  javascript_origins: ['http://localhost'],
};

exports.getAuthorizeUrl = (callback) => {
  const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret, credentials.redirect_uris[0]);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope,
  });

  callback(null, authUrl);
}

exports.getAccessToken = (callback) => {
  const code = process.env.GOOGLE_AUTH_CODE || '';
  const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret, credentials.redirect_uris[0]);
  oauth2Client.getToken(code).then(callback);
}

exports.tokens = {
  access_token: process.env.GOOGLE_ACCESS_TOKEN || '',
  token_type: 'Bearer',
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN || '',
  expiry_date: 1586987686541,
};
