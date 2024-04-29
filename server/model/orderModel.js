import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    productName:{
        type:String,
        required:true
    }
})

export default mongoose.model('Order',orderSchema)






const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productName :{
        type:String,
        requred:true
    },
    brand:{
        type:String,
        requred:true
    },
    model:{
        type:String,
        requred:true
    },
    category:{
        type:String,
        requred:true
    },
    description:{
        type:String,
        requred:true
    },
    price:{
        type:Number,
        requred:true
    },
    discountPrice:{
        type:Number,
        requred:true
    },
    discount:{
        type:Number,
        requred:true
    },
    dialColor:{
        type:String,
        requred:true
    },
    strapColor:{
        type:String,
        requred:true
    },
    image:[{
        type:String,
        requred:true
    }],
    status:{
        type:Boolean,
        default:true
    },
    inStock:{
        type:Number,
        requred:true
    },
    popularProduct:{
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
})

module.exports=mongoose.model('Products',productSchema)