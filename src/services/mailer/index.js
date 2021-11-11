const nodemailer = require('nodemailer');

const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { credentials, tokens } = require('../../config/google-auth.js');
const { FE_ADDR, EMAIL_ADDR, EMAIL_NAME } = require('../../config/index.js');

const transportConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'Gmail',
  from: `"${EMAIL_NAME}" <${EMAIL_ADDR}>`,
  auth: {
    type: 'OAuth2',
    user: EMAIL_ADDR,
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expires: tokens.expiry_date,
  },
}

const handlebarsOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve(__dirname, './templates/'),
    layoutsDir: path.resolve(__dirname, './templates/'),
    defaultLayout: 'password-reset-instru-email.html',
  },
  viewPath: path.resolve(__dirname, './templates/'),
  extName: '.html',
};




exports.sendPasswordResetIntru = async(email, jwt) => {
  const data = {
    to: email,
    template: 'password-reset-instru-email',
    subject: 'NEXUS App Password Reset',
    context: {
      url: `${FE_ADDR}/password-reset/${jwt}`,
    },
  };
  const gmailTransport = nodemailer.createTransport(transportConfig);
  gmailTransport.use('compile', hbs(handlebarsOptions));
  try {
    const info = await gmailTransport.sendMail(data);
    return info;
  } catch(e) {
  console.log(e);
  }
};

// exports.sendEmail = sendPasswordResetIntru;
