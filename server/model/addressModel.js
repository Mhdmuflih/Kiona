import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    addresses:[
        {
            name:{
                type:String,
                required:true
            },
            address:{
                type:String,
                required:true
            },
            pincode:{
                type:Number,
                required:true
            },
            locality:{
                type:String,
                required:true
            },
            mobile:{
                type:Number,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            defaultAddress:{
                type:Boolean,
                required:true,
                default:false
            },
            addressType:{
                type:String,
                required:true
            }
        }
    ]
})

export default mongoose.model("Address",addressSchema)