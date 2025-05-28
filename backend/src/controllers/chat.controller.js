import { generateStreamToken } from "../utils/stream.js"

export const getStreamToken = async (req, res) => {
    try {
        const token = generateStreamToken(req.user.id)
    
        res.status(200).json({
            token
        })
    
    } catch (error) {
       console.log("Error in getStreamToken controller: ", error.message);
       res.status(500).json({
        success: false,
        message: "Internal server error "
       })
        
    }

}