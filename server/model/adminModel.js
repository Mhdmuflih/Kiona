import mongoosh from "mongoose"

const adminSchema = new mongoosh.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})

export default mongoosh.model("Admin",adminSchema)