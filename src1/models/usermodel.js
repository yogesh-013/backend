import mongoose  from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    fullname : {
        type : String , 
        required : true  , 
        
    } , 
    username : {
        type : String , 
        required : true , 
        unique : true , 
        lowercase : true , 
        trim : true 
    },
    email : {
        type : String , 
        required : true , 
        unique : true , 
        lowercase : true , 
        trim : true 
    } , 
    password : {
      type : String , 
      required : true 
    } , 
    watchHistory :  [
      {  type : mongoose.Schema.Types.ObjectId , 
        ref : "Video"}
    ], 
    avatar : {
        type : String , 
        required : true 
       
    }, 
    coverImage : {
        type : String , 
     
    }, 
    refreshToken : {
        type : String , 
        
    }

    

} , {
    timestamps : true 
})
userSchema.pre('save' , async  function(next){
   if(!this.isModified("password")){
    return next()
   }
   this.password = await bcrypt.hash(this.password , 10 )
})
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password  , this.password) 
}
userSchema.methods.generateAccessToken =  function(){
     return   jwt.sign(
        {
            _id :  this._id ,
            email : this.email ,
            password : this.password , 
            fullname : this.fullname  

        }, 
      "386b3fb360ee7166303f60cfa243a73495c5aa417751e4dc412bda9a38249fa1", 
        {
            expiresIn : '15m'
        }
     )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id  
    }), 
    "60e268ce9503df740d6eeeecc4211cc84203e4d5ccbd17dbb1674e65becfaa4d",
    {
        expiresIn : '7d'
    }
}

export const User = mongoose.model("User" , userSchema)
