import mongoose from "mongoose";

const categoryOfferSchema = new mongoose.Schema({
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    offer:{
        type:Number,
        required:true
    },
    createDate:{
        type:Date,
        default:Date.now
    },
    expaireDate:{
        type:Date,
        required:true
    }
    
})

export default mongoose.model("CategoryOffer",categoryOfferSchema)