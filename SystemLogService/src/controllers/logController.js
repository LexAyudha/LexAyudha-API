const logModel = require("../models/logModel");
const HttpStatus = require("../enums/httpStatus");
const { Logger } = require("winston");
const { default: mailService } = require("../../config/nodeMailerConfig");
const { publishErrorEvent } = require("../../config/eventBroker");

exports.insertLog = async(req,res) => {
  try {
    const logPayload = req?.body;

    const logModel = {
      logType: logPayload?.logType,
      logDescription: logPayload?.logDescription,  
      logDate: new Date()
    }

    const response = await logModel.create(logModel);
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('insertLog',error?.message);
    Logger.error('at insertLog(): ',error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

exports.deleteLogFromDB = async(req,res) => {
  try {
    const logId = req?.body?.logId;
    const response = await logModel.deleteOne({ _id: logId });
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('deleteLogFromDB',error?.message);
    Logger.error('at deleteLogFromDB(): ',error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}
exports.getALog = async(req,res) => {
  try {
    const logId = req?.params?.id;
    const response = await logModel.findById(logId);
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getALog',error?.message);
    Logger.error('at getALog(): ',error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}

exports.getAllLogsInDB = async(req,res) => {
  try {
    const response = await logModel.find();
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getAllLogsInDB',error?.message);
    Logger.error('at getAllLogsInDB(): ',error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body:error};
  }
}

exports.getLogsFiltered = async(req,res) => {
  try {
    const filter = req?.body;
    const response = await logModel.find(filter); 
    return { status: HttpStatus.OK, body: response };
  } catch (error) {
    await publishErrorEvent('getLogsFiltered',error?.message);
    Logger.error('at getLogsFiltered(): ',error);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: error };
  }
}