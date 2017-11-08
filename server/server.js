var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('md5');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // * : allow all origins
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept');
  next();
});

app.use(bodyParser.json());

app.post('/users', (req,res) => {
  var newUser = new User(req.body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).status(201).send(newUser);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.post('/login', (req, res) => {
  var body = _.pick(req.body, ['username','password']);

  User.findByCredentials(body.username, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).status(200).send(user);
    });
  }).catch((err) => {
    res.status(400).send();
  });
});

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user);
});

app.get('/users',(req,res) => {
  User.find({},'username nombre apellido fechaDeNacimiento fechaDeRegistro activo').then( (users) => {
    res.send({users});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
