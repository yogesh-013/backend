import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiHandler.js";
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
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
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
    throw new ApiError(401 , "Something is wrong with avatar")
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

export default registerUser;
