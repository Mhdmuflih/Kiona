import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    cartItems:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:'Product'
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ]
})

export default mongoose.model('Cart',cartSchema);