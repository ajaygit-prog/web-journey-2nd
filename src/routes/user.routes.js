import { Router } from "express" 
import { logoutUser, registerUser } from "../controllers/user.controllers.js"
import {upload } from "../middlewares/multer.middleware.js"
import { loginUser } from "../models/login.model.js"

const router = Router() 

router.route("/register").post(
    upload.fields([
        {
            name : "avtar",
            maxCount : 1
        } , 
        {
            name : "coverImage" ,
            maxCount : 1
        }
    ]) ,
    registerUser)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(veifyJWT , logoutUser)



export default router 