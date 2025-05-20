/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const { getAllLessons, updateLesson, addNewLesson } = require('../services/lessonService')

// Middleware to extract userId from access token
const extractUserId = (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid Authorization header format. Expected: Bearer <token>' 
      });
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is missing' 
      });
    }

    try {
      // Verify the token and extract userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.userId) {
        return res.status(401).json({ 
          message: 'Invalid token format: missing userId' 
        });
      }

      // Add userId to request object
      req.userId = decoded.userId;
      
      next();
      
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: jwtError.message 
      });
    }

  } catch (error) {
    console.error('Token extraction failed:', error.message);
    return res.status(500).json({ 
      message: 'Internal server error during authentication',
      error: error.message 
    });
  }
};

// Apply middleware to all routes
router.use(extractUserId);

//Get all lessons
router.get('/', async(req,res) => {
  const userId = req?.userId;
  await getAllLessons(req,res,userId)
  
})

//Update lesson
router.put('/:id', async(req,res) => { 
   const userId = req?.userId;
   await updateLesson(req,res,userId)
})

//Add new Lesson
router.post('/', async (req, res) => {
   const userId = req?.userId;
    await addNewLesson(req,res,userId)
})

//Exporting router to be used by the app.js
module.exports = router