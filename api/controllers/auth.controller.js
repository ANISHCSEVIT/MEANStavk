import Role from "../models/Role.js";
import Users from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreatSuccess } from "../utils/success.js";
import { CreateError } from "../utils/error.js";
import nodemailer from 'nodemailer'
import UserToken from "../models/UserToken.js";

export const register = async(req, res, next)=>{
    const role = await Role.find({role:'Users'});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new Users({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: hashPassword,
        roles: role
    });
    await newUser.save();
    return res.status(200).json("User Registered Successfully");
}

export const registerAdmin = async(req, res, next)=>{
    const role = await Role.find({});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new Users({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: hashPassword,
        isAdmin: true,
        roles: role
    });
    await newUser.save();
    return res.status(200).json("User Registered Successfully");
}

export const login = async(req, res, next)=>{
    try {
        const user = await Users.findOne({email: req.body.email})
        .populate("roles", "role");

        const { roles} = user;
        if(!user){
            return res.status(404).send("User not Found!");
        }
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).send("Password is incorrect!");
        }
        const token = jwt.sign(
            {id:user._id, isAdmin: user.isAdmin, roles: roles},
            process.env.JWT_SECRET
        )
        res.cookie("access_token", token, {httpOnly: true})
        .status(200)
        .json({
            status:200,
            message: "Login Success!",
            data: user
        })
    } catch (error) {
        return res.status(500).send("Something went Wrong!");
    }
}

export const sendEmail =async(req, res, next)=>{
    const email = req.body.email;
    const user = await Users.findOne({email: {$regex: '^'+email+'$', $options: 'i'}});
    if(!user){
        return next(!CreateError(404), "User not found to reset the email!")
    }
    const payload ={
        email: user.email
    }
    const expiryTime = 300;
    const token =jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: expiryTime});

    const newToken = new UserToken({
        userId: user.id,
        token: token
    }); 

    const mailTransporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"anishsiddhartha1803@gmail.com",
            pass:"pexrfzhipchofyam"
        }
    });
    let mailDetails = {
        from : "anishsiddhartha1803@gmail.com",
        to: email,
        subject: "Reset Password",
        html: `
        <html>
        <head>
        <title>Password Reset Request</title>
        </head> <body>
        <h1>Password Reset Request</h1>
        <p>Dear ${user.username}, </p>
        <p>We have received a request to reset your password for your account with BookMYBook. To complete the password reset process, please click on the button below:</p> 
        <a href=${process.env.LIVE_URL}/reset/${token}><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; 
        cursor: pointer; border-radius: 4px;"> Reset Password</button></a>
        <p>Please note that this link is only valid for 5mins. If you did not request a password reset, please disregard this message.</p>
         <p>Thank you, </p> 
         <p>Let's Program Team</p>
        </body>
        </html>
        `
    };
    mailTransporter.sendMail(mailDetails, async(err, data)=>{
        if(err){
            console.log(err);
            return next(CreateError(500, "Something went Wrong while sending the email"))
        }else{
            await newToken.save()
            return next(CreatSuccess(200, "Email Sent sucessfully"))
        }
    })

}

export const resetPassword = (req, res, next)=>{
    const token = req.body.token;
    const newPassword = req.body.password;

    jwt.verify(token, process.env.JWT_SECRET, async(err, data)=>{
        if(err){
            return next(CreateError(500, "ResetLink is expired"))
        }else{
            const response = data;
            const user = await Users.findOne({email: {$regex: '^'+ response.email +'$', $options: 'i'}});
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(newPassword,salt);
            user.password = encryptedPassword
            try {
                const updatedUser= await Users.findOneAndUpdate(
                    {_id: user._id},
                    {$set: user},
                    {new: true}
                )
                return next(CreatSuccess(200, "Password Reset Success")) 
            } catch (error) {
                return next(CreateError(500,"Something Went Wrong!"))
            }
        }
    })
}