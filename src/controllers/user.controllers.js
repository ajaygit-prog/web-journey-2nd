import { asyncHandeler } from "../utils/asyncHanderer.js";
import {ApiError} from '../utils/ApiError.js' ;
import {User} from '../models/user.model.js';
import { ApiResponse } from "../utils/ApiRsponse.js";
import { uploadCloudinary} from '../utils/cloudinary.js'
import  jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken ()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave : false })

        return { accessToken , refreshToken }


    } catch (error) {
        throw new ApiError(500 , "something went wrong while generation refresh and access token" )
    }
}

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


const loginUser = asyncHandeler(async (req , res) =>{
    // req body se data lao
    //user or email se 
    //find the user 
    //password check
    //access and refresh token
    //send token cookies 


    //req.body se data liya
    const {username,email,password} = req.body

    //check kiye ki username or password both must be filled
    if(!(username || email)) {
        throw new ApiError(400 , " username or password is required ") 
    }

    // now check that username or email exist in the database or not
    const user = await User.findOne({
        $or: [{username} , {email}]
    })


    // agar user is not found in the database then throw error
    if(!user) {
        throw new ApiError(404 , "user does not exist")
    }

    //now user pakka mil gaya hai  and next check password matching
    const isPasswordValid = await user.isPasswordCorrect(password) ;


    //check that password is same agr same hoga to isPasswordValid me true stroe hoga otherwise false store hua hoga .....
    if (!isPasswordValid) {
      throw new ApiError(401, "Password is incorrect");
    }

    // ham uper ek access and refresh token ka method hi bana dete hai vaise to yaha bhi likhoge to bhi tkk hai lekin upr likhoge to clean lagega code isliye upr likhe hai

    const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id)

    // now you send token throw cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") ;
    // cokies bhejana 
    const options = {
        httpOnly : true ,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200 , {
            user:loggedInUser , accessToken , refreshToken
        } , "user loggedin successfully ")
    )




})


const logoutUser = asyncHandeler(async (req ,res) =>{
    //console.log("user logout id is : ", req.user._id)
    await User.findByIdAndUpdate(req.user._id ,
        {
            $set : {
                refreshToken: undefined
            }
        },
        {
            new : true
        }

    )
    const options = {
        httpOnly : true ,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , " User logged Out successfully"))
})


const refreshAccessToken = asyncHandeler(async(req ,res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    // ye or me req.body.refreshToken isliye likhe hai taki agr koi mobile app use kr rha hai i mean app version to use kaise cookies se refreshToken milega kyuki cookies to browser me hota hai

    if(!incommingRefreshToken){
        throw new ApiError(401 , "unauthorized request")
    }

    try {
        const decodedIncommingRefreshToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET) ;
    
        const user = await User.findById(decodedIncommingRefreshToken?._id)
    
        if (!user) {
          throw new ApiError(401, "invalid refresh Token");
        }
    
        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , " Refresh token expired or used ")
        }
    
        const options = {
            httpOnly : true ,
            secure : true
        }
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(200 ,
                {accessToken , refreshToken : newRefreshToken},
                "Access token refreshed"
    
            )
        )
    
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandeler(async(req,res) => {
    const {oldPassword , newPassword} = req.body 

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401 , "Invalid old password")

    }
    user.password = newPassword ;
    await user.save({validateBeforeSave: false})
    return res.status(200)
    .json(new ApiResponse(200 , {} , "password change successfully"))
})

const getCurrentUser = asyncHandeler(async(req,res) =>{
    return res.status(200)
    .json(200 , req.user , "current user fetched successfully")
})

const updateAccountDetails = asyncHandeler(async(req,res)=>{
    const {fullName , email } = req.body

    if(!fullName || !email) {
        throw new ApiError(400,"All fields are required")
    }
    const user = User.findByIdAndUpdate(req.user?._id ,
        {
            $set : {
                fullName ,
                email: email
            }
        },{new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200 , user ,"Account Uddated"))
})


const updateUserAvtar = asyncHandeler(async(req,res)=>{
    const avtarLocalPath = req.file?.path

    if(!avtarLocalPath){
        throw new ApiError(400 , "Avtar file is missing")
    }
    const avtar = await uploadCloudinary(avtarLocalPath)
    if (!avtar.url) {
      throw new ApiError(400, "error while uploading on avtar");
    }


    const user  = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avtar: avtar.url,
        },
      },
      {
        new: true,
      }
    ).select("-password")
    return res
      .status(200)
      .json(new ApiResponse(200, user, "avtar updated successfully"));

})


const updateUserCoverImage = asyncHandeler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage  file is missing");
  }
  const coverImage = await uploadCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading on coverImage");
  }

  const user  = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200 , user , "cover image updated successfully"))
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvtar,
  updateUserCoverImage
};