import {StreamChat} from "stream-chat"
import dotenv from "dotenv"
dotenv.config()

const apiKey = process.env.QUICKCHAT_API_KEY
const apiSecret = process.env.QUICKCHAT_API_SECRET

if (!apiKey || !apiSecret) {
    console.error("Api key and secret is missing");
}


const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData
    } catch (error) {
        console.error("Error upserting stream user", error);
        
    }
}


export const generateStreamToken = (userId) => {
    try {
        // ensure user id in string 
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr)
    } catch (error) {
        console.log("Error generating stream token: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}