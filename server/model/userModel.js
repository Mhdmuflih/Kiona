import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        require:true
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