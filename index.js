const express = require("express")
const Server = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morganMiddleware = require('./middleware/morgan')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const { DocumentationOptions } = require("./Swagger/General.Js")
const specs = swaggerJsDoc(DocumentationOptions)
require("dotenv").config()

// Define Cors Policy
const corsOptions = {
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    optionsSuccessStatus: 200, // For legacy browser support
    credentials: true,

}

// Define Server Middleware
Server.use(cors(corsOptions))
Server.use(express.json())
Server.use(cookieParser())
Server.use(morganMiddleware)

// Define Routers
const authRouter = require('./routes/authentificationController')
const router = require('./routes/router.js')
const healthRouter = require("./routes/healthController")
const roomRouter = require('./routes/roomController')
const ticketRouter = require("./routes/ticketController")

// Add Start Route
Server.get('/', (req, res) => {
    return res.status(200).send('Welcome to the SelfService Rest API! Have a nice day')
})

// Add default routes
Server.use("/api", router)

// Add documentation route
Server.use("/documentation", swaggerUI.serve, swaggerUI.setup(specs))

// Add health routes
Server.use("/health", healthRouter)

// Add authentification routes
Server.use("/authentification", authRouter)

// Add room routes
Server.use("/rooms", roomRouter)

// Add ticket routes
Server.use("/tickets", ticketRouter)

// Start server
Server.listen(process.env.Application_Port, () => {
    console.log("Server is running on Port " + process.env.Application_Port)
})