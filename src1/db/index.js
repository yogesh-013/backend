import mongoose from 'mongoose'
import {DB_NAME} from "../constant.js"
import dotenv from "dotenv"
dotenv.config()
async function connectDb(){
    console.log(process.env.MONGODB_URI)
    console.log(process.env.PORT)
    try{
         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         console.log(`DB-Host : ${connectionInstance}`)  
    }catch(error){
       console.log("Mongo Db error" , error);
       process.exit(1)
    }
}
export default connectDb ; 