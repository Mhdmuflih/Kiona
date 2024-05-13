import mongoose from "mongoose";

const productOfferSchema = new mongoose.Schema({
    productId:{
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
});

export default mongoose.model("ProductOffer", productOfferSchema)