const { insertLog, deleteLogFromDB, getALog, getAllLogsInDB, getLogsFiltered } = require('../controllers/logController')



exports.createLog = async (req, res) => {

  const response = await insertLog(req, res)
  res.status(response.status).send(response.body)

}

exports.deleteLog = async (req, res) => {
  const response = await deleteLogFromDB(req, res)
  res.status(response.status).send(response.body)
}
exports.getLog = async (req, res) => {
 const response =  await getALog(req, res)
 res.status(response.status).send(response.body)
}

exports.getAllLogs = async (req, res) => {
  const response = await getAllLogsInDB(req, res)
  res.status(response.status).send(response.body)
}

exports.getFilteredLogs = async (req, res) => {
  const response = await getLogsFiltered(req, res)
  res.status(response.status).send(response.body)
}