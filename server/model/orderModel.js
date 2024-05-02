import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    orderItems:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true
            },
            image:[{
                type:String,
                required:true
            }],
            productName:{
                type:String,
                required:true
            },
            productPrice:{
                type:String,
                required:true
            },
            category:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            cartQuantity:{
                type:Number,
                required:true
            },
            totalPrice:{
                type:Number,
                required:true
            },
            orderStatus: {
                type: String,
                default: "Ordered",
                required: true
            },
            returnReason: {
                type: String,
            },
            cancelReason: {
                type: String,
            },
            totalAmount: {
                type: Number
            }
        }
    ],
    paymentMethod:{
        type:String,
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now()
    },
    address:{
        name:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true,
        },
        pincode:{
            type:String,
            required:true
        },
        locality:{
            type:String,
            required:true
        },
        address:{
            type:String,
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
        addressType:{
            type:String,
            required:true
        }
    }
})



export default mongoose.model('Order',orderSchema)