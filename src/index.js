// require('dotenv').config()

import dotenv from 'dotenv' ;
import {connectDB}  from "./db/connectDb.js";


// FIRST APPROACH TO CONNECT DATABASE : 

dotenv.config() ;

connectDB() ;














// SECOND APPROACH TO CONNECT DATABASE  : 

/* 
import mongoose from 'mongoose'  ;
import { DB_NAME } from './constants';

import express from "express" ;
const app = express() ;

;( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("db is connected")

        app.on(error , (err)=>{
            console.log("ERROR :" ,err) ;
            throw err ;
        })

        app.listen(process.env.PORT , ()=> {
            console.log(`app is listening on port ${process.env.PORT}`) ;
        })
    }
    catch (error){
        console.error("ERROR :" ,error)
        throw error
    }
})()
*/
