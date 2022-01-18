const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const config = require('dotenv'); // .env file
const bcrypt = require('bcryptjs');
// single database connection shared to all routes
// other routes can access using getDb
// const initDb = require("./db/db.js").initDb
// const getDb = require("./db/db.js").getDb
const bodyParser = require("body-parser")
const cors = require("cors");

const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require("crypto");
const path = require('path');


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const app = express()

var corsOptions = {
  origin: "http://localhost:3000"
};

const indexRouter = require('./routes/index.js')
// const projectsRouter = require('./routes/projects.js')


app.set('view engine','ejs')
// app.set('views', __dirname + '/views')
// app.set('layout','layouts/layout')
// app.use(expressLayouts)
// app.use(express.static('public'))

// parse requests of content-type - application/json
app.use(cors(corsOptions));
app.use(methodOverride('_method'));
// possible fix the CORS issue - Ajay's
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin','*');
  next()
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({extended: true}));
app.use(express.json()) 


app.get("/", (req, res) => {
  res.json({ message: "Welcome to NEXUS UW application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// const conn = db.mongoose.createConnection(process.env.MONGODB_URI,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });
//

const mongoURI = process.env.MONGODB_URI
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

const upload = multer({ storage,
  limits: {fileSize: 200000000},
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb('filetype');
}

exports.upload = upload;

require('./routes/auth.js')(app);
require('./routes/projects.js')(app);
require('./routes/profile.js')(app, upload);
require('./routes/constants.js')(app);
