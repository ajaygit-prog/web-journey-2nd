import { asyncHandeler } from "../utils/asyncHanderer.js";


const registerUser = asyncHandeler( async (req , res) => {
    res.status(200).json({
        message : "ok"
    })
})


export { registerUser}