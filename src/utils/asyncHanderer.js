const asyncHandeler =(requestHandler) =>{
    (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export { asyncHandeler };


// second method

// const asyncHandeler = (fn) => async (req,res,next) =>{
//     try {
//         await fn(req,res,next)
        
//     } catch (error) {
//         res.status(error.code || 500).joson({
//             success : false ,
//             message :error.message
//         })
//     }
// };