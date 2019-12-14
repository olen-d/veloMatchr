// Models
console.log("usersController");
const { User } = require("../models");

// Packages
const jwt = require("jsonwebtoken");

// Helpers
// const auth = require("../helpers/auth-module");
const bcrypt = require("../helpers/bcrypt-module");

exports.create_user = (req, res) => {
  const { firstName, lastName, email, phone, password, gender, latitude, longitude } = req.body;
  console.log("REQ BODY:\n", req.body);
  bcrypt.newPass(password).then(pwdRes => {
    if(pwdRes.status === 200) {
      console.log("usersController, pwdRes.status: Bcrypt Successful");
      const name = firstName + "." + lastName.slice(0,1);
      const photoLink = req.file.path;

      User.create({
        name,
        password: pwdRes.passwordHash,
        firstName,
        lastName,
        email,
        phone,
        photoLink,
        gender,
        latitude,
        longitude,
        city: "blank",
        state: "blank",
        stateCode: "blank",
        country: "blank",
        countryCode: "bla"
      }).then(user => {
        console.log("USER RESULT\n",user);
        console.log("ID\n", user.id);
        jwt.sign(
          {user: user.id},
          process.env.SECRET,
          { expiresIn: "1h" },
          (err, token) => {
            return res.status(200).json({
              authenticated: true,
              token
            });
          });
      }).catch(err => {
        console.log("usersController, User.create, error:\n", err);
        res.status(500).json({ error: err });
      });
    } else {
      console.log("usersController, bcrypt.newPass, error:\n", "No Password Created");
      res.status(500).json({ error: "userController 107" });
    }
  });
};

exports.read_one_user = (req, res) => {
  res.send("XYZZY");
  const userName = req.params.username;
  // res.json({cheese: "burger"});
  console.log("userName:\n", userName);

  User.findOne({
    where: {
      name: userName
    }
  })
  .then(resolve => {
    let userObj = {
      user: resolve
    };
    delete userObj.user.password;
    res.send(userObj);
  })
  .catch(err => {
    res.json(err);
  });
};

exports.read_login = (req, response) => {
  const { username, pass } = req.body;

  User.findOne({
    where: {
      email: username
    }
  })
  .then(user => {
    if (user != null) {
      bcrypt
        .checkPass(pass, user.password)
        .then(res => {
          if (res.status === 200 && res.login) {
            delete user.password;

            jwt.sign(
              {user: user.id},
              process.env.SECRET,
              { expiresIn: "1h" },
              (err, token) => {
                return response.status(200).json({
                  authenticated: true,
                  token
                });
              }
            );
          } else {
            return response.status(500).json({
              authenticated: false
            });
          }
        })
        .catch(error => {
          response.json(error);
        });
    } else {
      return response.status(404).json({
        authenticated: false
      });
    }
  });
};
