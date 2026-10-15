import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log(
//     Boolean(cloudinary.config().api_key)  to check that config is actually done or not
// )

const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)return "file not found" ;
        // upload the file on clodinary 
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })
        //file has been uploaded successfully 
        //console.log("file uploaded on cloudinary successfully",response.url)

        fs.unlinkSync(localFilePath) ;
        return response ;
    } catch (error) {
        console.log("error in cloudinary is ", error)
        fs.unlinkSync(localFilePath) // remove the locaally saved file from the server
        return null ;
    }
}

export {uploadCloudinary}