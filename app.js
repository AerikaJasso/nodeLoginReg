const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const http = require('passport-http');
const mongoose = require('mongoose');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const flash = require('connect-flash');
const flashMessage = require('express-messages');
const expressValidator = require('express-validator');
const session = require('express-session');
const config = require('./config/database');

const app = express();


const users = require('./routes/users');
const index = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Handle File Uploads
// app.use(multer({ dest: './uploads' }));



// Handle Express Sessions
app.use(session({
    secret: 'armbar',
    saveUninitialized: true,
    resave: true 
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        let namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());
// Send Flash Messaging
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Make the user global to routes
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database: ' + config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database Error: ' + err);
});

app.use('/', index);
app.use('/users', users);

app.use((err, res, next) => {
    let error = new Error('Not found');
    err.status = 404;
    next(err);
})
port = 3000;

app.listen(port, () => {
    console.log("We are up and runnin on port:", port);
})