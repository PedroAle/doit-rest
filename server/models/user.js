var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var uniqueValidator = require('mongoose-unique-validator');
var md5 = require('md5');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var nombreValidator = [
  validate({
    validator: 'isLength',
    arguments: [3,50],
    message: 'Debe contener entre {ARGS[0]} y {ARGS[1]} caracteres'
  }),
  validate({
    validator: 'isAlpha',
    passIfEmpty: true,
    message: 'Solo se permiten letras'
  })
];

var fechaDeNacimientoValidator = [
  validate({
    validator: function minorValidator(value) {
      var currentYear = new Date().getFullYear();
      return (currentYear - value.getFullYear() > 17);
    },
    message: 'El usuario debe ser mayor de edad'
  })
];

//Este validator es inutil porque esta recibiendo una contrase;a ya hasheada (MD5), asi que sera alfanumerico
var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [7,50],
    message: 'La contrase;a debe tener entre 7 y 50 caracteres'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'La contrase;a solo admite caracteres alfanumericos'
  })
];

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3,50],
    message: 'Debe tener entre 3 y 50 caracteres'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Solo admite caracteres alfanumericos'
  })
];

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: usernameValidator
  },
  password: {
    type: String,
    required: true,
    validate: passwordValidator
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    validate: nombreValidator
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
    validate: nombreValidator
  },
  fechaDeNacimiento: {
    //YYYY-MM-DD
    type: Date,
    required: true,
    validate: fechaDeNacimientoValidator
  },
  formaDeRegistro: {
    /*
    *  0 - Request directo
    *  1 - Web app
    *  2 - Android app
    */
    type: Number,
    required: true
  },
  fechaDeRegistro: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  salt: {
    type: String,
    default: 'fuck'
  },
  tokens: [{
    access:{
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
},
//Esto permite pushear a MongoDB los array sin errores
{usePushEach: true}
);

userSchema.plugin(uniqueValidator);

userSchema.methods.toJSON = function(){
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id','username','nombre','apellido',
'fechaDeNacimiento','formaDeRegistro','fechaDeRegistro','activo']);
};

userSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  //Recorar cambiar el secret 123456 del token
  var token = jwt.sign({_id: user._id.toHexString(), access}, '123456').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

userSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, '123456');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

//Esto se corre antes de guardar el usuario a la base de datos (.save())
userSchema.pre('save', function(next){
  var user = this;
  //Verificamos que se haya cambiado la password, porque si no, estariamos volviendo a hashearla
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
        user.salt = salt;
        var hashedPassword = md5(user.password + user.salt);
        user.password = hashedPassword;
        next();
    });
  } else {
    next();
  }
});

userSchema.methods.validPassword = function (nonHashedPassword) {
  var user = this;
  var hashIt = md5(nonHashedPassword + user.salt);
  return hashIt.valueOf() === user.password;
};

userSchema.statics.findByCredentials = function (username, password){
  var user = this;

  return user.findOne({username}).then((user) => {
    if(!user){
      console.log("User no encontrado");
      return Promise.reject();
    } else {
      return new Promise((resolve, reject) => {
        if (user.validPassword(password)){
          resolve(user);
        } else {
          console.log("Contraseña invalida");
          reject();
        }
      });
    }
  });
};

var User = mongoose.model('User',userSchema);

module.exports = {
  User: User
}
