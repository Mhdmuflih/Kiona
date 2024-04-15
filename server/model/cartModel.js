import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.SchemaType.objectId,
        required:true
    },
    cartItems:[
        {
            productId:{
                type:mongoose.SchemaType.objectId,
                required:true
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ]
})

export default mongoose.model('Cart',cartSchema);