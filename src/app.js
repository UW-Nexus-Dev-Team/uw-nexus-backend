const express = require('express')
const cors = require("cors");

const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const methodOverride = require('method-override');
const crypto = require("crypto");
const path = require('path');
const cookieParser = require('cookie-parser')
const { authJwt } = require("./middlewares");
const config = require('./config/index.js');

const app = express()

var corsOptions = {
  origin: config.FE_ADDR,
  credentials: true,
};

app.set('view engine','ejs')
app.use(cookieParser())

// parse requests of content-type - application/json
app.use(cors(corsOptions));
app.use(methodOverride('_method'));

app.set("trust proxy", 1); 

// possible fix the CORS issue - Ajay's
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods",  "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", config.FE_ADDR);
  res.setHeader("Access-Control-Allow-Headers", "Accept,Accept-Language,Content-Language,Content-Type,Authorization,Cookie,X-Requested-With,Origin,Host");
  next()
});

app.use(express.urlencoded({extended: true}));
app.use(express.json({limit: '100mb'})) 
app.use(authJwt)


app.get("/", (req, res) => {
  res.json({ message: "Welcome to NEXUS UW application." });
});

// set port, listen for requests
const PORT = config.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const mongoURI = config.MONGODB_URI
const mongoose = require('mongoose');
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const docUpload = multer({ storage,
  limits: {fileSize: 200000000},
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb, /pdf|docx/);
  },
});

const imgUpload = multer({
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb, /jpg|jpeg|gif|png/);
  },
  limits: {
    fileSize: 5000000
  }
});

function checkFileType(file, cb, filetypes) {
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb('filetype');
}

exports.docUpload = docUpload;
exports.imgUpload = imgUpload;

require('./routes/auth.js')(app);
require('./routes/projects.js')(app);
require('./routes/profile.js')(app, docUpload, imgUpload);
require('./routes/constants.js')(app);
require('./routes/email.js')(app);
