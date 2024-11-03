const express = require("express")
const cors = require("cors")
const connectDB = require('./config/database')
const commonRoutes = require('./src/routes/commonRoutes')
const adminRoutes =  require('./src/routes/adminRoutes')

connectDB.getInstance()

const app = express()

app.use(cors())
app.use(express.json())

//routes here
app.use('/common', commonRoutes)
app.use('/admin',adminRoutes)

//Exporting app to be used by the server.js
module.exports = app