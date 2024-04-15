import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        require:true,
        default:false
    },
    is_admin:{
        type:Number,
        default:0,
    },
    is_verified:{
        type:String,
        default:0
    }
})

export default mongoose.model('User', userSchema)