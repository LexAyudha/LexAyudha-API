const express = require("express")
const cors = require("cors")
const connectDB = require('./config/database')
const speechRoutes = require('./src/routes/speechRoutes')


connectDB();

const app = express()

app.use(cors())
app.use(express.json())

//routes here
app.use('/', speechRoutes)


//Exporting app to be used by the server.js
module.exports = app