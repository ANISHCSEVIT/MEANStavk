import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import roleRoute from './routes/role.js';
import authRoute from './routes/auth.js';
import userRoute from './routes/user.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

app.use(express.json());
app.use("/api/role",roleRoute);
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

//Response handler Middleware

app.use((obj, req, res, next)=>{
    const statusCode = obj.status || 500;
    const message= obj.message || "Something Went Wrong!";
    return res.status(statusCode).json({
        success:[200,201,204].some(a=> a === obj.status) ? true : false,
        status: statusCode,
        message:message,
        data: obj.data
    });
});



//DB Connection
const connectMongoDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Database!")
    } catch (error) {
        throw error
    }
}

app.listen(process.env.PORT, ()=>{
    connectMongoDB();
    console.log("Connected to Backend!");
});