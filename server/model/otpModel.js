import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
    OTP:{
        type:Number,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    createdAT:{
        type:Date,
        default:Date.now
    },
    expaireAT:{
        type:Date,
        default:Date.now()+3000*1,
        expaire:'2m'
    }
})

export default mongoose.model('OTP',otpSchema)