
import Razorpay from "razorpay";

// ----------------------------------------------

import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import Order from "../model/orderModel.js";
// ----------------------------------------------

//razor pay instance
var razorpayInstance = new Razorpay({
  key_id:"rzp_test_FRaUz1vihG1Qvx",
  key_secret: "nuvwbLogUjNjYJEXtu5BR6dp"
});


//payment
const payment = async (req,res)=>{
    try {
        const user = req.session.user_id
        const cart = req.session.cartProduct
        const address = req.session.address_data
        const cartAllProduct = req.session.cartAllProduct
        const paymentMethod = req.body.payment
        const totalPrice = req.session.totalPrice

        let cartQuantity = []
        for(let i=0 ; i<cart.length ; i++){
            cartQuantity.push(cart[i].cartItems.quantity)
        }
        
        const orderItems = [];

        for(let i=0 ; i<cartAllProduct.length ; i++){

            let item  = cartAllProduct[i]
            let total = 0;

            if(item.offerPrice){
                total = item.offerPrice*cartQuantity[i]
            }else{
                total = item.price*cartQuantity[i]
            }

            orderItems.push({
                productId: item._id,
                image: item.image,
                productName: item.name,
                productPrice: item.price,
                offerPrice:item.offerPrice,
                offer:item.offer,
                category: item.category,
                quantity: item.quantity,
                description: item.description,
                cartQuantity:cartQuantity[i],
                totalPrice:total
            })
            await Product.findByIdAndUpdate( { _id:item._id }, { $inc: { quantity:-cartQuantity[i] } } );
        }

        const order = new Order({
            userId:user,
            orderItems:orderItems,
            address:address,
            paymentMethod:paymentMethod,
            orderDate: new Date(),
            totalAmount:totalPrice
        })
        const saveOrder = await order.save();

        await Cart.deleteOne({userId:user});

        delete req.session.cartProduct;
        delete req.session.address_data;
        delete req.session.cartAllProduct;

        if(paymentMethod === "Online Payment"){

            const option = {
                amount: totalPrice,
                currency: "INR",
                receipt: `order_rcption_${saveOrder._id}`,
                payment_capture: "1"
            }

            const razorpayOrder = await razorpayInstance.orders.create(option)

            return res.status(200).json({
                success: true,
                message:"Order Created ready for Payment",
                key_id: "rzp_test_FRaUz1vihG1Qvx",
                totalPrice:totalPrice,
                orderId: saveOrder._id,
                razorpayOrderId:razorpayOrder._id
            });
        }else{

            if(saveOrder){
                return res.json({ success: true, message: "Order saved successfully" });
            }else{
                return res.json({ success: false, message: "Failed to save order" });
            }
        }
        
    } catch (error) {
        console.log(error);
    }
}

//verify payment
const verifyPayment = async (req, res) => {
    try {
        const { paymentId, orderId } = req.body;

        const verifyPayment = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { paymentStatus: "Payment Completed" } }
        );

        console.log(verifyPayment, 'verify payment');

        if (verifyPayment) {
            return res.json({ success: true, message: "Payment status updated successfully" });
        } else {
            return res.json({ success: false, message: "Failed to update payment status" });
        }
    } catch (error) {
        console.error("Error occurred while updating payment status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//order success
const orderSuccessPage = async(req,res)=>{
    try {
        
        res.render('users/checkout/orderSuccess.ejs')

    } catch (error) {
        console.log(error.message);
    }
}

export{
    payment,
    verifyPayment,

    orderSuccessPage
}