import Order from "../model/orderModel.js";
import User from "../model/userModel.js";


//order Page
const orderPage = async(req,res)=>{
    try {
        const orderData = await Order.find()
        let users = [] ;
        
        for(let i=0 ; i<orderData.length ; i++){
            const userId = orderData[i].userId
            const user = await User.findOne({ _id:userId })
            users.push(user)
        }
        console.log(orderData);
        
        res.render('admin/order/order.ejs',{ order:orderData, users });

    } catch (error) {
        console.log(error.message);
    }
}

//order Details page
const orderDetailsPage = async(req,res)=>{
    try {
        
        const {id} = req.query
        const orderData = await Order.findOne({_id:id})

        res.render('admin/order/orderDetails.ejs',{order:orderData})

    } catch (error) {
        console.log(error.message);
    }
}

//order status update
const orderStatus = async (req, res) => {
    try {

        const { id, value } = req.body;

        let update = {};
        if( value === "Ordered" || value === "Shipped" || value === "Cancelled" ){
            update =  { $set:{ "orderItems.$.orderStatus": value } }
        }else if( value === "Delivered" ){
            update = { $set:{ "orderItems.$.orderStatus": value, "orderItems.$.paymentStatus":"Payment Completed." } }
        }

        const response = await Order.findOneAndUpdate({ 'orderItems._id':id }, update);

        if(response){
            return res.json({success:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

export {
    orderPage,
    orderDetailsPage,

    orderStatus
}