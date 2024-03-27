import mongoosh from "mongoose"

const userSchema = new mongoosh.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
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
    is_verified:{
        type:String,
        default:0
    }
})

export default mongoosh.model('User', userSchema)