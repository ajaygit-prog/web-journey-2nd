import { asyncHandeler } from "../utils/asyncHanderer.js";
import {ApiError} from '../utils/ApiError.js' ;
import {Userser} from '../models/user.model.js';
import { uploadCloudinary } from '../utils/cloudinary.js' ;
import { ApiResponse } from "../utils/ApiRsponse.js";

const registerUser = asyncHandeler( async (req , res) => {
    // get user details fromfrontend
    //validation  - not empty
    //check if user already exist: from username and email
    // check for images , check for avtar
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName , email , username, password} = req.body ;
    console.log("email : " , email) ;

    // if(fullName === "") {
    //     throw ApiError(400 , "fullname is required")
    // } niche valla if and uper vala if both are same bs niche valla is liye likhe hai ki baar baar ye likhana na pade if
    if (
        [fullName , email , username , password].somme((field)=> field?.trim()==="")
    ){
        throw new ApiError(400 , "all fields is required")
    }

    const existedUser = User.findOne({
        $or :[{ username } , { email }]
    })

    if(existedUser) {
        throw new ApiError(409 , "User with email Or usernamealready  exist")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path ;
    if(!avtarLocalPath) {
        throw new ApiError(400 , " Avtar file is required ")
    }


    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avtar) {
        throw new ApiError(400, " Avtar file is required ");
    }
    const User = await User.create({
        fullName,
        avtar : avtar.url ,
        coverImage : coverImage?.url || "" ,
        email ,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if(!createdUser) {
        throw new ApiError(500 , "something went wrong while registring the user ")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "user registerwd Successfully")
    )
})


export { 
    registerUser ,
}