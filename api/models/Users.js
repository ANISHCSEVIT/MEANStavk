import mongoose, {Schema} from "mongoose";

const UserSchema = mongoose.Schema(
    {
        firstName:{
            type:String,
            required: true
        },
        lastName: {
            type:String,
            required: true
        },
        userName: {
            type:String,
            required: true,
            unique: true
        },
        email: {
            type:String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            required: false,
            default:"C:\Users\Administrator\Pictures\ANISH-min-min.jpeg"
        },
        isAdmin: {
            type: Boolean,
            deafult: false
        },
        roles: {
            type: [Schema.Types.ObjectId],
            required: true,
            ref: "Role"
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Users", UserSchema);