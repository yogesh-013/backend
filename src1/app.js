import express from "express"
import cookieparser from "cookie-parser"
import cors from "cors"
import bodyParser from "body-parser"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(bodyParser.json({limit: "16kb"}))
app.use(bodyParser.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieparser())
import router from "./routes/user.routes.js"
app.use("/api/v1/users" , router)
export default app 