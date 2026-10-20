import { ApiError } from "../utils/ApiError";
import { asyncHandeler } from "../utils/asyncHanderer";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model' ;



export const verifyJWT = asyncHandeler( async (requestAnimationFrame,res , next ) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
    
        if(!token) {
            throw new ApiError(401 , " unauthorized access")
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            // discuss about frontend
            throw new ApiError(401 , "Invalid access token")
        }
    
        req.user = user ;
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "invalid access token "
        )
    }


})