
import dotenv from 'dotenv' ;

// FIRST APPROACH TO CONNECT DATABASE : 

dotenv.config({
    path: './.env'
}) ;

// import { connectDB } from './db/connectDb.js' ;
// import { app } from './app.js' ;
const { connectDB } = await import("./db/connectDb.js");
const { app } = await import("./app.js"); 


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,() => {
        console.log(`server is running at PORT : ${process.env.PORT}`) ;
    })
})
.catch((error)=>{
    console.log("mongoDB connection failed ", error) ;
}) ;




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

        app.on('error' , (err)=>{
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
