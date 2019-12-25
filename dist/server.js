"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var metrics_1 = require("./metrics");
var bodyparser = require("body-parser");
var session = require("express-session");
var levelSession = require("level-session-store");
var user_1 = require("./user");
var app = express();
var port = process.env.PORT || '8090';
var metrics = require('./metrics.ts');
var path = require('path');
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
var LevelStore = levelSession(session);
var dbUser = new user_1.UserHandler('./db/users');
var authRouter = express.Router();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.set('views', __dirname + "/view");
app.set('view engine', 'ejs');
/* METRICS */
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send();
    });
});
app.get('/metrics', function (req, res) {
    dbMet.getAll('0', function (err, result) {
        if (err)
            throw err;
        res.status(200).send(result);
    });
});
app.get('/', function (req, res) {
    res.render('home.ejs');
    res.end();
});
app.get('/hello/:name', function (req, res) {
    res.render('hello.ejs', { name: req.params.name });
    res.end();
});
app.get('/metrics.json', function (req, res) {
    metrics.get(function (err, data) {
        if (err)
            throw err;
        res.status(200).json(data);
    });
});
/* USER */
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
//ROUTER CLASS  ----------- GET FUNCTION --------------
authRouter.get('/home', function (req, res) {
    res.render('home.ejs');
});
authRouter.get('/login', function (req, res) {
    var errormsg = "";
    res.render('login.ejs', { errormsg: errormsg });
});
authRouter.get('/register', function (req, res) {
    res.render('register.ejs');
});
authRouter.get('/logout', function (req, res) {
    console.log('je suis laaaaa');
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/home');
});
//ROUTER CLASS  ----------- POST FUNCTION --------------
authRouter.post('/login', function (req, res, next) {
    var errormsg = ""; //to print an error message 
    console.log('je suis là ');
    dbUser.get(req.body.username, function (err, result) {
        if (err)
            next(err);
        {
            errormsg = "there is an error with username and/or password please retry";
            res.render({ errormsg: errormsg }, 'login.ejs');
        }
        if (result === undefined || !result.validatePassword(req.body.password)) {
            errormsg = "password is incorrect";
            res.redirect('/login', { errormsg: errormsg });
        }
        else {
            req.session.loggedIn = true;
            req.session.user = result;
            res.redirect('/hello');
        }
    });
});
authRouter.post('/register', function (req, res, next) {
    var errormsgregister = ""; //to print an error message 
    console.log('je suis là ');
    dbUser.get(req.body.username, function (err, result) {
        if (err)
            next(err);
        {
            errormsgregister = "username already taken please chose another one";
            res.render('register.ejs');
        }
        if (req.body.username == "" || req.body.email == "" || req.body.password == "") {
            errormsgregister = "all fields are mandatory";
            res.render('register.ejs');
        }
        else {
            var new_user = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(new_user, function (err) {
                dbUser.get(req.body.username, function (err, result) {
                    if (err)
                        next(err);
                    else {
                        req.session.loggedIn = true;
                        req.session.user = result;
                        res.redirect('/hello');
                    }
                });
            });
        }
    });
});
authRouter.post('/logout', function (req, res, next) {
    console.log('okkkk');
    res.redirect('/home');
});
/////// NEW USER /////////////
app.use(authRouter);
var userRouter = express.Router();
userRouter.post('/', function (req, res, next) {
    dbUser.get(req.body.username, function (err, result) {
        if (!err || result !== undefined) {
            res.status(409).send("user already exists");
        }
        else {
            dbUser.save(req.body, function (err) {
                if (err)
                    next(err);
                else
                    res.status(201).send("user persisted");
            });
        }
    });
});
userRouter.post('/logout', function (req, res) {
    res.render('home.ejs');
});
userRouter.get('/:username', function (req, res, next) {
    dbUser.get(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else
            res.status(200).json(result);
    });
});
app.use('/user', userRouter);
//Log in correctly working or not ? 
var authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else
        res.redirect('/home');
};
//redirecting to home profile (hello page)
app.get('/', authCheck, function (req, res) {
    res.render('hello', { name: req.session.username });
});
app.listen(port, function (err) {
    if (err) {
        throw err;
    }
    console.log("server is listening on port " + port);
});
