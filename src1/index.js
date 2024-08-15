import connectDb from "./db/index.js";
import dotenv from "dotenv"
import app from './app.js'
dotenv.config({
    path : './.env'
})
connectDb()
.then(()=>{
 app.listen(8000 , ()=>{
    console.log(`Server is running at Port : ${process.env.PORT}`);
 })
})
.catch((error)=>{
console.log(error)
})