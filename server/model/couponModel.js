import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    createDate:{
        type:Date,
        default: Date.now
    },
    expaireDate:{
        type:Date,
        required:true
    }
})

export default mongoose.model("CouponOffer",couponSchema)