import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME ,
    api_key :  process.env.API_KEY, 
    api_secret : process.env.API_SECRET 
})
const  uploadInCloudinary = async (localfilePath)=>{
   try{
      if(!localfilePath){
        return null 
      }
      const response = await cloudinary.uploader.upload(localfilePath , {
        resource_type : "auto"
      })
      fs.unlinkSync(localfilePath)
      return response ; 
   }catch(error){
    fs.unlinkSync(localfilePath)
    console.log(error)
    return null ; 
   }
}
export default uploadInCloudinary 