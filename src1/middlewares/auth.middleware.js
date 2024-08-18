import { ApiError } from "../utils/ApiHandler.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/usermodel.js";
//  take  cookies from the req 
// take the accessToken from the cookies 
// verify the token with your  AccessToken_secretkey (token contains three things ---- header ---payload data ---secret_key)
// if verified we can access the paylaod data which is id , fullname , username , email if provided 
// then after doing all the stuff just get the data from the id and send it with your request to logout functionality or anywhre u want and thats why we are using it as a middleware
// then pass the command to next middleware 
export const verifyToken = asyncHandler(async (req , res , next) =>{
   try{
         const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer " , "")
         console.log(req.cookies);
         console.log(token);
         
         
         if(!token){
            throw new ApiError(401 , "Unauthorized Request")
         }
         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
         if(!decodedToken){
            throw new ApiError(401 , "Invalid Access Token")
         }
         console.log("Decoded Token" , decodedToken)
         const user = User.findById(decodedToken?._id).select("-password -refreshToken")
         if(!user){
            throw new ApiError(401 , "Invalid Access Token")
         }
         req.user = user 
         next()
   }catch(error){
      throw new ApiError(401 , error?.message || "Invalid Access Token")
   }
})