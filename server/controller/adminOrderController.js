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
const orderSatus = async(req,res)=>{
    try {
        console.log('koooiii');
        const { productId } = req.body.productId
        console.log(productId,'id ndd');
        console.log(req.body,'query um ndd tooo');

    } catch (error) {
        console.log(error.message);
    }
}

export {
    orderPage,
    orderDetailsPage,

    orderSatus
}