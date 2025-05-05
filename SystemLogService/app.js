const express = require("express")
const cors = require("cors")
const connectDB = require('./config/database')
const logRoutes = require('./src/routes/logRoutes')
const {consumeEvents} = require('./config/eventConsumer')


connectDB();

const app = express()

app.use(cors())
app.use(express.json())

//routes here
app.use('/', logRoutes)

consumeEvents()

//Exporting app to be used by the server.js
module.exports = app