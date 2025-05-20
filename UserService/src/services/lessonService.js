const {getAllLessonsById, updateLesson,addNewLesson} = require('../controllers/lessonController')


exports.getAllLessons = async (req, res, userId) => {
    

    const id = userId
    
    const response = await getAllLessonsById(id)

    res.status(response.status).json(response.body)
}


exports.addNewLesson = async (req, res, userId) => {
    
    const payload = req?.body
    const id = userId
    
    const response = await addNewLesson(id, payload)

    res.status(response.status).json(response.body)
}

exports.updateLesson = async (req, res, userId) => {
    
    const payload = req?.body
    const id = userId
    const lessonId = req?.params?.id
    
    const response = await updateLesson(lessonId, id, payload)

    res.status(response.status).json(response.body)
}