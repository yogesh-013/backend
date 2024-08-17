import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name : "dfoda6rio" ,
    api_key : "539926881817629", 
    api_secret : "OeMkyGM3ITIHpb067kgr4MW1LgU"  
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
  /*   fs.unlinkSync(localfilePath) */
  fs.unlinkSync(localfilePath)
    console.log("fucking error " , error)

    return null ; 
   }
}
export default uploadInCloudinary 