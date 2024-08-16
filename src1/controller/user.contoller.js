import asyncHandler  from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiHandler.js"
import { User } from "../models/usermodel.js"
import uploadInCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req , res)=>{
    //  get User details 
    // validate details
    // check whether user already has a account 
    // upload image if provided by user in cloudinary
    // create user object - create entry in db
    // removes the password and refresh token from response
    // check whether account is created successfully 
    // return response 
    const {username , fullname , email , password} = req.body
    console.log("email : " , email)
    if([fullname , username , email , password].some((field)=>field?.trim()==="")){
        throw new ApiError(400 , "All fields are required ")
    }
    const existedUser  = await User.findOne({
        $or : [{email} , {username}]
    })
    if(existedUser){
        throw new ApiError(409 , "User already existed")
    }
    const  avatarLocalPath = req.files?.avatar[0]?.path;
    const  coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is required")
    }
    const avatar = await uploadInCloudinary(avatarLocalPath)
    const coverImage = await uploadInCloudinary(coverImageLocalPath)
if(!avatar){
    throw new ApiError(400 , "Avatar field is required")
}
const user = await User.create({
    fullname , 
    avatar : avatar.url ,
    coverImage : coverImage?coverImage.url : "" , 
    email , 
    password , 
    username : username.tolowerCase()
})
 
 const findUser =  await  User.findById(user._id).select(
    "-password -refreshToken"
 )
 if(!findUser){
   throw new ApiError(500 , "Internal Server Error")
 }

return res.status(200).json(
    new ApiResponse(200 , findUser , "User is Successfully registered ")
)
    
    
   /* res.status(200).json({
    message : "ok"
   }) */
})
export default registerUser