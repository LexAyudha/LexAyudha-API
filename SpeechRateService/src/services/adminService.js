const {createUser} = require('../controllers/adminController')
const bcryptjs = require("bcryptjs");
const saltCount = 10;


const hashPasswordGen = async (plainPsw) => {
    const hashPsw = await bcryptjs.hash(plainPsw, saltCount);
    return hashPsw;
  };

exports.addNewUser = async(req,res) => {

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

 
    res.status(response.status).json(response.body);

}

