import mongoose from 'mongoose' 


const loginSchema  = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password : {
        type : String,
        required : [true , 'password is required']
    }


} , {timestamps : true})


export const userLogin = mongoose.model("userLogin" , loginSchema) ;