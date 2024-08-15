import mongoose from "mongoose"
const videoSchema = mongoose.Schema({
    videoFile : {
        type : String ,// cloudnary
         required : true 
    },
    thumbnail : {
type : String , //cloudinary url 
required : true , 
    }, 
   title : {
  type  : String , 
  required : true , 

   }, 
   owner : {
type : mongoose.Schema.Types.ObjectId , 
ref : "User"
   },
   description : {
type : String , 
required : true 
   }, 
   duration : {
     type : Number , 
     required : true 
   },
   views : {
type : Number , 
  default  : 0 
   },
   isPublished : {
    type : Boolean  , 
    default : false 
   }, 

}, {
    timestamps : true 
})
export const Video = mongoose.model("Video" , videoSchema)