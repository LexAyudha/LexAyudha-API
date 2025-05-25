/**
 * @description - Authentication related business logic handled here
 * @functionality - extract JSON payload, setting response header, handling business logic, and setting up JWT tokens
 */
const bcryptjs = require("bcryptjs");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { createUser, getUserByField } = require("../controllers/userController");
const saltCount = 10;
const HttpStatus = require("../enums/httpStatus");
const { getAccessToken, getRefreshToken } = require("../services/jwtService");
const userModel = require("../models/userModel");
const { publishErrorEvent } = require("../../config/eventBroker");

require("dotenv").config();

//Hasing the password added data privacy & security
const hashPasswordGen = async (plainPsw) => {
  const hashPsw = await bcryptjs.hash(plainPsw, saltCount);
  return hashPsw;
};

exports.register = async (req, res) => {
  const payload = req?.body;

  const existingUser = await userModel.findOne({
    $and: [
      {
        $or: [{ userName: payload?.userName }],
      },
      { isActive: true },
    ],
  });

  if (existingUser) {
    return res
      .status(HttpStatus.CONFLICT)
      .json({ message: "User with the same email or username already exists" });
  }

  const hashedPassword = await hashPasswordGen(payload?.password);

  //Constructing the new user payload
  const newUser = {
    userName: payload?.userName || `user${Math.floor(Math.random() * 1000)}`,
    email: payload?.email,
    proPic: payload?.proPic || process.env.DEFAULT_PROFILE_PICTURE,
    coverPic: payload?.coverPic || process.env.DEFAULT_COVER_PICTURE,
    password: hashedPassword,
  };

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
  const payload = req?.body;
  const filterField = { email: payload?.email };

  const foundUsers = await getUserByField(filterField);

  if (foundUsers?.status === HttpStatus.OK) {
    const users = foundUsers?.body;
    let authenticatedUser = null;

    for (const user of users) {
      if (user?.isActive === false) {
        break;
      }
      const checkPswMatch = await bcryptjs.compare(
        payload?.password,
        user?.password
      );
      if (checkPswMatch) {
        authenticatedUser = user;
        break;
      }
    }

    if (authenticatedUser) {
      // Setting up the JWT tokens. Access token contains userID and user type. Expires in 1 hour. Refresh token only store the user id. Expires in 3 months
      const accessToken = getAccessToken(
        authenticatedUser?._id,
        authenticatedUser?.userName,
        authenticatedUser?.email
      );
      const refreshToken = getRefreshToken(
        authenticatedUser?._id,
        authenticatedUser?.userName,
        authenticatedUser?.email
      );

      // Setting the response header with OK and dispatching the JWT Tokens in a JSON body
      res
        .status(HttpStatus.OK)
        .json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      // If password didn't match, unauthorize the login request
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ body: "User authentication failed!" });
    }
  } else {
    // if user not found sets request headers to unauthorized and sends authentication failed message to the client
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ body: "User authentication failed!" });
  }
};

exports.generateOTP = async (req, res) => {
  try {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    //send the otp to the user's email in here
    console.log(otp);
    // const hashedOtp = CryptoJS.SHA256(otp).toString(CryptoJS.enc.Hex);

    res.status(HttpStatus.OK).json({ otp: otp });
  } catch (error) {
    await publishErrorEvent("generateOTP", error?.message);
    console.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error generating OTP" });
  }
};
