import asyncHandler from "../utils/asyncHandler.js";
import {ApiError } from "../utils/ApiHandler.js";
import { User } from "../models/usermodel.js";
import uploadInCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;
  console.log('Received form data :', { username, fullname, email, password });

  if ([fullname, username, email, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required ");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  console.log('Existed user:', existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already existed");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let coverImageLocalPath ; req.files?.coverImage?.[0]?.path;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
coverImageLocalPath = req.files.coverImage[0].path 
  }
  console.log("Req Files : ",  req.files)
  if(!avatarLocalPath){
    throw new ApiError(401 , "Something is wrong with avatar")
  }
  console.log('Files:', { avatarLocalPath, coverImageLocalPath });

  let avatar, coverImage;
  if (avatarLocalPath) {
    avatar = await uploadInCloudinary(avatarLocalPath);
    console.log('Avatar uploaded:', avatar);
  }
  if(!avatar){
    res.status(400).json(new  ApiError(401 , "Something is wrong with avatar"))
    
  }

  if (coverImageLocalPath) {
    coverImage = await uploadInCloudinary(coverImageLocalPath);
    console.log('Cover image uploaded:', coverImage);
  }

  const user = await User.create({
    fullname,
    avatar: avatar ? avatar.url : "",
    coverImage: coverImage ? coverImage.url : "",
    email,
    password,
    username,
  });

  const findUser = await User.findById(user._id).select("-password -refreshToken");
  console.log('User created:', findUser);

  if (!findUser) {
    throw new ApiError(500, "Something went wrong");
  }
  console.log(user)
  

  return res.status(200).json(new ApiResponse(200, findUser, "User is Successfully registered"));
});

//Login of User
//req body
// checking if there exists a such username or email
// find the user
//password check
// access token and refresh token 
// send cookie
const generateAccessAndRefreshToken = async  (user_id)=>{
   const user = User.findById(user_id)
   const accessToken =  user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()
   user.refreshToken = refreshToken
   await user.save({validationBeforeSave : false})
   return {accessToken , refreshToken}
}
const loginUser = asyncHandler(async (req , res) =>{
  const {email , username , password} = req.body
  if(!(username || password)){
    throw new ApiError(400 , "Username or email is required")
  }
  const existedUser = await User.findOne({
    $or : [{username} , {email}]
  })
  if(!existedUser){
    throw new ApiError(402 , "User is not registered")
  }
  const isPasswordValid = await existedUser.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401 , "Invalid User Credentials")
  }
  const {accessToken , refreshToken} = generateAccessAndRefreshToken(existedUser._id)
  const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")
  const option = {
    httpOnly : true , 
    secure : true 
  }
  return res.status(200).cookie("accessToken" , accessToken , option)
  .cookie("refreshToken" , refreshToken , option)
  .json(
    new ApiResponse(
      200 , 
      {
        user : loggedInUser , accessToken , refreshToken
      } , 
      "User Logged in successfully"
    )
  )


})
const logoutUser = asyncHandler(async (req, res)=>{
        await User.findByIdAndUpdate(req.user._id, {
          $unset : {
            refreshToken : 1
          }
        } , 
      {
        new  : true 
      })
      const option = {
        httpOnly : true , 
        secure : true 
      }
      return res.status(200)
      .clearCookie("accessToken" , option)
      .clearCookie("refreshToken" , option)
      .json(
        new ApiResponse(200 , {} , "User Logged Out")
      )
})

export {registerUser , loginUser , logoutUser};
