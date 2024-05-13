import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offerPrice:{
        type:Number,
    },
    offer:{
        type:Number,
    },
    image:[{
        type:String,
        required:true
    }
    ],
    description:{
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
    delete:{
        type:Boolean,
        default:false
    }
})

export default mongoose.model('Product', productSchema)