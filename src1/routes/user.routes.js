import {Router} from "express"
import {loginUser, logoutUser, registerUser} from "../controller/user.contoller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(upload.fields([
  {
    name : "avatar" , 
    maxCount : 1 , 
  } , 
  {
    name : "coverImage" , 
    maxCount : 1 , 
  }
]) , registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyToken , logoutUser)
export default router 