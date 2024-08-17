import { ApiError } from "../utils/ApiHandler.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/usermodel.js";
export const verifyToken = asyncHandler(async (req , res , next) =>{
   try{
         const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer " , "")
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