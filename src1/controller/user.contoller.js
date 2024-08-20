import asyncHandler from "../utils/asyncHandler.js";
import {ApiError } from "../utils/ApiHandler.js";
import { User } from "../models/usermodel.js";
import uploadInCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async  (user_id)=>{
  try {
       const user = await User.findById(user_id)
       if(!user){
        throw new ApiError(400 , "user not found")
       }
       
       const accessToken =  user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       user.refreshToken = refreshToken
       await user.save({validationBeforeSave : false})
       return {accessToken , refreshToken}
  } catch (error) {
    throw new ApiError(500 , error.message)
  }
  }
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log("Elements:", req.body);

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!existedUser) {
    throw new ApiError(402, "User is not registered");
  }

  console.log(existedUser);

  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  console.log(isPasswordValid);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);
  console.log("Access Token" , accessToken)
  console.log("Refresh Token" , refreshToken)
  const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true // Use secure cookies only in production
    
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged in successfully"
      )
    );
});
                  //LOGOUT 
//after passing from middleware we get the user data from request
//get the user data from id and update the refresh token to 1 and clear cookie so that he cant access 
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

// REFRESH TOKEN
const refreshAccessToken = asyncHandler(async (req , res)=>{
  try {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
      throw new ApiError(401 , "Unauthorized Request")
    }
    const decodedToken = jwt.verify(incomingRefreshToken , 
      process.env.REFRESH_TOKEN_SECRET)
      if(!decodedToken){
        throw new ApiError(401 , "Invalid Refresh Token")
      }
      const user = await User.findById(decodedToken?._id)
      if(!user){
        throw new ApiError(401 , "Invlalid Token Access")
      }
       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401 , "refresh Token is expired or used")
       }
       
       const options = {
        httpOnly: true,
        secure: true
      }
      
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
      
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401 , error?.message || "Invalid Refresh Token")
  }
    
})
const changeCurrentPassword = asyncHandler(async (req, res)=>{
   const {oldPassword , newPassword , confirmPassword} = req.body
   if(!(confirmPassword === newPassword)){
    throw new ApiError(400 , "Password and ConfirmPasswrod should be same")
   }
   const user = await User.findById(req.user?._id)
   if(!user){
    throw new ApiError(200 , "User is not logged in")
   }
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400 , "Invalid Old Password")
  }
   user.password = newPassword
  await user.save({validateBeforeSave : false})

  return res.status(200).json(new ApiResponse(200 , "Password Changed Successfully"))

})

/////////////////////////////

const getCurrentUser = asyncHandler(async (req , res)=>{
  return res.status(200)
  .json(new ApiResponse(200 , req.user , "User fetched Successfully"))
})

////////////////////////

const updateAccountDetails = asyncHandler(async(req , res)=>{
  const{fullname , email} = req.body
  if(!fullname || !email){
    throw new ApiError(400 , "Both fields are required")
  }
  const updatedUserDetails = await User.findByIdAndUpdate(req.user._id , 
    {
         $set : {
          fullname : fullname ,
          email : email
         }
    } , 
    {
      new : true 
    }
  ).select("-password")
  return res.status(200)
  .json(new ApiResponse(200 , "User Details Updated Sucessfully"))

})

///////////////////////////////

const updateUserAvatar = asyncHandler(async (req , res)=>{
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar is reqired")
  }
  const avatar = await uploadInCloudinary(avatarLocalPath)
  if(!avatar){
    throw new ApiError(500 , "Error in uploading file in cloudinary")
  }
  const upload = await User.findByIdAndUpdate(req.user?._id , 
  {
        $set : {
          avatar : avatar.url
        }
    },
    {
      new : true 
    }
  ).select("-password")
  return res.status(200)
  .json(
    new ApiResponse(200 , "Avatar Updated Successfully" ))
})

/////////////////////////////////////

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  //TODO: delete old image - assignment


  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")
  return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})
//////////////////////////////////////
const getUserChannnelProfile = asyncHandler(async (req , res)=>{
  const username = req.params 
  if(!username){
    throw new ApiError(400 , "Username not found")
  }
    const channel = await User.aggregate([
      {
        $match : {
          username : username?.toLowerCase() 
        }
      },
      {
        $lookup : {
          from : "subscriptions" , 
          localField : "_id" , 
          foreignField : "channel" , 
          as : "subscribers"
        }
      }, 
      {
        $lookup : {
          from : "subscriptions" , 
          localField : "_id" , 
          foreignField : "subscriber" , 
          as : "subscribedTo"
        }

      },
      {
        $addFields : {
          subscriberCount : {
            $size : "$subscribers"
          },
          channelSubscribesToCount : {
            $size : "$subscribedTo"
          }, 
          isSubscribed : {
            $cond : {
              if :{$in : [req.user?._id , "$subscribers.subscriber"]},
              then : true , 
              else : false 

            }
          }
        }
      }, 
      {
        $project : {
          fullname : 1 , 
          username : 1 , 
          subscriberCount : 1 ,
          channelSubscribesToCount : 1, 
          isSubscribed : 1  , 
          avatar : 1 , 
          coverImage : 1 , 
          email : 1 
        }
      }
    ])
    if(!channel){
      throw new ApiError(400 , "Username does not exist")
    }
    res.status(200)
    .json(new ApiResponse(200 , channel[0] , "User Details Fetched Successfully"))
})

export {registerUser ,
  loginUser , 
  logoutUser ,
  refreshAccessToken ,
changeCurrentPassword , 
getCurrentUser , 
updateUserAvatar , 
updateUserCoverImage , 
getUserChannnelProfile

};
