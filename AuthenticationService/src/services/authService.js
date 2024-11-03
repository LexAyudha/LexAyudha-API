/**
 * @description - Authentication related business logic handled here
 * @functionality - extract JSON payload, setting response header, handling business logic, and setting up JWT tokens
 */
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, getUserByName } = require("../controllers/userController");
const saltCount = 10;
const HttpStatus = require("../enums/httpStatus");
const { getAccessToken, getRefreshToken } = require("../services/jwtService");

require("dotenv").config();

//Hasing the password added data privacy & security
const hashPasswordGen = async (plainPsw) => {
  const hashPsw = await bcryptjs.hash(plainPsw, saltCount);
  return hashPsw;
};

exports.register = async (req, res) => {
  const payload = req.body;

  const hashedPassword = await hashPasswordGen(payload.password);

  //Constructing the new user payload
  const newUser = {
    userName: payload.userName,
    email: payload.email,
    image: payload.image,
    password: hashedPassword,
    mobileNo: payload.mobileNo,
    userRole: payload.userRole,
  };

  console.log(newUser);

  //Registering the user with createUser function in userController.js
  const response = await createUser(newUser);

  //Auto-login the user upon successful registration to the system.
  if (response.status === HttpStatus.CREATED) {
    await this.login(req, res);
  } else {
    res.status(response.status).json(response.body);
  }
};

exports.login = async (req, res) => {
  const payload = req.body;

  const foundUser = await getUserByName(payload.userName);

  if (foundUser.status === HttpStatus.OK) {
    const retrivedUser = foundUser.body;
    console.log("user is ", retrivedUser);

    if (retrivedUser) {
      //Once the user is found in the system check for password matching to validate the user
      const checkPswMatch = await bcryptjs.compare(
        payload.password,
        retrivedUser.password
      );

      //if password matches, authenticate the user with JWT Token
      if (checkPswMatch === true) {
        //Setting up the JWT tokens. Access token contains userID and user type. Expires in 1 hour. Refresh token only store the user id. Expires in 3 months
        const accessToken = getAccessToken(
          retrivedUser._id,
          retrivedUser.userRole,
          retrivedUser.userName,
          retrivedUser.image
        );
        const refreshToken = getRefreshToken(
          retrivedUser._id,
          retrivedUser.userRole,
          retrivedUser.userName,
          retrivedUser.image
        );

        //Setting the response header with OK and dispatching the JWT Tokens in a JSON body
        res
          .status(HttpStatus.OK)
          .json({ accessToken: accessToken, refreshToken: refreshToken });
      } else {
        //If password didn't match, unauthorize the login request
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ body: "User authentication failed!" });
      }
    } else {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ body: "User authentication failed!" });
    }
  } else {
    //if user not found sets request headers to unauthorized and sends authentication failed message to the client
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ body: "User authentication failed!" });
  }
};

//logout user
exports.logout = async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "logged Out!",
  });
};
