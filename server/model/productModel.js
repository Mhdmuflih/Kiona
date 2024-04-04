import mongoosh from "mongoose";

const productSchema = new mongoosh.Schema({
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
    }
})

export default mongoosh.model('Product', productSchema)