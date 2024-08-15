import mongoose from 'mongoose'
import {DB_NAME} from "../constant.js"
import dotenv from "dotenv"
import express from "express"
dotenv.config({
    path : './env'
})
const app = express()
async function connectDb(){
    console.log(process.env.MONGODB_URI)
    console.log(process.env.PORT)
    try{
         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         console.log(`DB-Host : ${connectionInstance.connection.host}`)  
         app.on("error" , (error)=>{
          console.log("error" , error);
          throw error 
         })
         
    }catch(error){
       console.log("Mongo Db error" , error);
       process.exit(1)
    }
}
export default connectDb ; 