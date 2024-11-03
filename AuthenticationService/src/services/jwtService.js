/**
 * @description - This service class is used to authenticate the request by checking the validity of JWT token
 * @functionality - Check for the JWT token, validate if available, extract user ID.
 */

//Requires
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sysWarn = require("../enums/systemWarnings");
const HttpStatus = require("../enums/httpStatus");

//Verifying JWT token
exports.verifyToken = async (req) => {
  //Extracting token from the header
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  //Checks for missing tokens
  if (!token) {
    return { status: HttpStatus.UNAUTHORIZED, body: sysWarn.MISSING_JWT_TOKEN };
  }

  try {
    //Decodes token and extract user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = {
      userId: decoded.userId,
      userType: decoded.userType,
      userName: decoded.userName
    };

    return { status: HttpStatus.OK, body: userData };
  } catch (error) {
    //If error occured during decode phase, responds with Invalid token message.
    return { status: HttpStatus.UNAUTHORIZED, body: sysWarn.INVALID_JWT_TOKEN };
  }
};

//Regenerate a new access token for the admin
exports.generateNewAccessToken = (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  //Checks for missing tokens
  if (!token) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ body: sysWarn.MISSING_JWT_TOKEN });
  }

  try {
    //Decodes token and extract user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const accessToken = jwt.sign(
      { userId: userId, userType: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(HttpStatus.OK).json({ accessToken: accessToken });
  } catch (error) {
    //If error occured during decode phase, responds with Invalid token message.
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ body: sysWarn.INVALID_JWT_TOKEN });
  }
};

//Generates access token
exports.getAccessToken = (userId, userRole, userName, image) => {
  const accessToken = jwt.sign(
    { userId: userId, userRole: userRole, userName: userName, image: image },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );

  return accessToken;
};

//Generates refresh token
exports.getRefreshToken = (userId, userRole, userName, image) => {
  const refreshToken = jwt.sign(
    { userId: userId, userRole: userRole, userName: userName, image: image },
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );

  return refreshToken;
};

