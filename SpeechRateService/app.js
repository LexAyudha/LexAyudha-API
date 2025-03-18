const express = require("express")
const cors = require("cors")
const connectDB = require('./config/database')
const speechRoutes = require('./src/routes/speechRoutes')
const handleUploadsRoute = require('./src/routes/handleUploadsRoute.js')
const path = require('path')

connectDB();

const app = express()

app.use(cors())
app.use('/uploads', handleUploadsRoute)
app.use(express.json())
app.use(express.static(path.join(__dirname,"src/public")))
//routes here
app.use('/', speechRoutes)


//Exporting app to be used by the server.js
module.exports = app