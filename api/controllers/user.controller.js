import Users from "../models/Users.js";
import { CreateError } from "../utils/error.js"
import { CreatSuccess } from "../utils/success.js";

export const getAllUsers = async(req, res, next)=>{
    try {
        const users = await Users.find();
        return next(CreatSuccess(200,"All Users", users));
    } catch (error) {
        return next(CreateError(500,"Internal server error"));
    }

}

export const getById = async (req, res, next)=>{
    try {
        const user = await Users.findById(req.params.id);
        if(!user)
            return next(CreateError(404, "User not found!"));
        return next(CreatSuccess(200, "Single User", user));
    } catch (error) {
        return next(CreateError(500,"Internal server error"));
    }
}