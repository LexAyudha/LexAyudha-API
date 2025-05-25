const {saveRecord, getRecordsById} = require('../controllers/recordController')


exports.saveRecords = async (req, res) => {
    const payload = req?.body
    const response = await saveRecord(payload)
    res.status(response.status).json(response.body)
}


exports.getRecords = async (req, res) => {
    
    const id = req?.params?.id

    const response = await getRecordsById(id)

    res.status(response.status).json(response.body)
}
