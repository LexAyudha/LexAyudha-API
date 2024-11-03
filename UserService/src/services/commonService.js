const { saveUserPreferences, deleteUser, getUsersByType, getUser } = require('../controllers/commonController')


exports.updateUser = async(req,res) => {

    
    const payload = req.body
    const email = req.body.email

    const response = await saveUserPreferences(email,payload)

    res.status(response.status).json(response.body)
} 

exports.deleteUser = async(req,res) => {
    const name = req.body.userName

    const response = await deleteUser(name)
    
    res.status(response.status).json(response.body)
}

exports.getAllUserByType = async(req,res) => {

    const userType = req.params.id

    const response = await getUsersByType(userType)

    res.status(response.status).json(response.body)
}

exports.getUserById = async(req,res) => {
    const userId = req.params.id

    const response = await getUser(userId)

    res.status(response.status).json(response.body)
}