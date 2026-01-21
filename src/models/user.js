import mongoose from "mongoose";
const {Schema} = mongoose

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:32
    },
    lastName:{
        type:String,
        minlength:2,
        maxlength:22
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,
    },
    age:{
        type:Number,
        min:10,
        max:60,

    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[String]
    },
    password:{
        type:String,
        required:true,
    }
    

}, {timestamps:true})

const User = mongoose.model('user',userSchema);
export default User;