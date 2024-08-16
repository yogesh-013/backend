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
    watchHistory :  {
        type : mongoose.Schema.Types.ObjectId , 
        ref : Video 
    }, 
    avatar : {
        type : String , 
        required : true 
    }, 
    coverImage : {
        type : String , 
        required : true 
    }, 
    refreshToken : {
        type : String , 
        required : true 
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
userSchema.methods.isPasswordCorrect = async function(){
   return await bcrypt.compare(password  , this.password) 
}
userSchema.methods.generateAccessToken = function(){
     return jwt.sign(
        {
            _id :  this._id ,
            email : this.email ,
            password : this.password , 
            fullname : this.fullname  

        }, 
        process.env.ACCESS_TOKEN_SECRET , 
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
     )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id  
    }), 
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model("User" , userSchema)
