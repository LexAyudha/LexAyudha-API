const userModel = require("../models/userModel");
const HttpStatus = require("../enums/httpStatus");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.insertSpeech = async (userId,speechFile) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(speechFile?.path));

    const response = await axios.post('http://localhost:5000/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to upload file to Flask server');
    }else{
      const speechRate = response?.data?.speechRate;
      await this.updateSpeech(userId, speechRate);
    }    
  } catch (error) {
    console.error(error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error.message };
  }
};

exports.updateSpeech = async (id, speechRate) => {
  try {
    const response = await userModel.updateOne({ _id: id }, { speechRate });
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    //Add a proper error login mechanism.
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

exports.getSpeech = async (id) => { 
  try {
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    //Add a proper error login mechanism.
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}
