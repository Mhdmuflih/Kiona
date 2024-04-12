import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    image:[{
        type:String,
        require:true
    }
    ],
    description:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    delete:{
        type:Boolean,
        default:false
    }
})

export default mongoose.model('Product', productSchema)