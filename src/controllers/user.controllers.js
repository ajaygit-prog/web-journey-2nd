import { asyncHandeler } from "../utils/asyncHanderer.js";
import {ApiError} from '../utils/ApiError.js' ;
import {User} from '../models/user.model.js';
import { ApiResponse } from "../utils/ApiRsponse.js";
import { uploadCloudinary} from '../utils/cloudinary.js'

const registerUser = asyncHandeler( async (req , res) => {
    //get user details from frontend
    //validation  - not empty
    //check if user already exist: from username and email
    //check for images , check for avtar
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName , email , userName, password} = req.body ;
    console.log("email : " , email) ;


    // if(fullName === "") {
    //     throw ApiError(400 , "fullname is required")
    // } niche valla if and uper vala if both are same bs niche valla is liye likhe hai ki baar baar ye likhana na pade if
    if (
        [fullName,email,userName,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400 , "all fields is required")
    }

    const existedUser = await User.findOne({
        $or:[{ userName } , { email }]
    })
    //console.log("promise : ", existedUser);
    if(existedUser) {
        throw new ApiError(409 , "User with email Or username already  exist")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;

    //const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    //uper vaali commented coverImage vaali line ko iss tarah bhi check kr skte hai ki vo present hai ki nahi .

    let coverImageLocalPath = "" ;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avtarLocalPath) {
        throw new ApiError(400 , " Avtar file is required1 ")
    }


    const avtar = await uploadCloudinary(avtarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if(!avtar) {
        throw new ApiError(400, " Avtar file is required2 ");
    }
    const user = await User.create({
        fullName,
        avtar : avtar.url ,
        coverImage : coverImage?.url || "" ,
        email ,
        password,
        userName : userName.toLowerCase()
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