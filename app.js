const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const createError = require('http-errors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const moment = require('moment')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use('/', router);
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router.get('/getTextFiles', (req, res) => {

  // Specify the folder path where the text files are stored
  const folderPath = path.join(__dirname, 'files');

  // Check if the folder exists
  if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Folder not found' });
  }

  // Read all files in the folder
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading folder' });
      }

      // Filter only text files (files with the .txt extension)
      const textFiles = files.filter(file => path.extname(file) === '.txt');

      res.json({ textFiles });
  });

});

router.post('/createTextFile', (req, res) => {

  const currentTimestamp = moment().format('LTS');
  const currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');

  // Specify the folder path where the file should be created
  const folderPath = path.join(__dirname, 'files');

  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
  }

  // Specify the file path
  const filePath = path.join(folderPath, `${currentDateTime}.txt`);

  // Write content to the file
  fs.writeFile(filePath, `Current Timestamp : ${currentTimestamp}`, (err) => {
      if (err) {
          return res.status(500).json({ error: 'Error creating file' });
      }
      else
      {
          res.status(200).json({ message: 'File created successfully' });
      }
  });

});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
