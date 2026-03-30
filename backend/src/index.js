import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config()
import connectDb from "../src/utils/db.js"
import authRoutes from "../src/routes/auth.route.js"
import userRoutes from "../src/routes/user.routes.js"
import chatRoutes from "../src/routes/chat.route.js"

const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ["http://localhost:5173",
    "https://quick-chat-p995u57d2-abhimanyu-kumars-projects-07c8c32a.vercel.app/login"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",  authRoutes )
app.use("/api/users",  userRoutes )
app.use("/api/chat",  chatRoutes )


// Database Connection
connectDb()


app.listen(port, () => {
    console.log(`Server is listining on ${port}`);
    
})