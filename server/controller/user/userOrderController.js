
import Razorpay from "razorpay";

// ----------------------------------------------

import Cart from "../../model/cartModel.js";
import Order from "../../model/orderModel.js";
import Product from "../../model/productModel.js";
import Wallet from "../../model/walletModel.js";

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

        if (!user || !cart || !address || !cartAllProduct || !paymentMethod || !totalPrice) {
            return res.status(400).json({ success: false, message: "Incomplete session data" });
        }

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

        if(paymentMethod === "Wallet"){
            const walletData = await Wallet.findOne({ userId:user })

            if (!walletData) {
                return res.json({ success: false, message: "Wallet not found" });
            }

            if (walletData.balance < totalPrice) {
                return res.json({ success: false, message: "Insufficient balance in your wallet" });
            }

            walletData.balance -= totalPrice;

            walletData.walletHistory.push({
                date: new Date(),
                description: "Payment for order",
                amount: -totalPrice,
            });

            await walletData.save();

        }else if(paymentMethod === "Cash On Delivery"){
            if(totalPrice > 2000){
                return res.json({ success: false, message: "Total price exceeds limit for Cash On Delivery" });
            }
        }else if(paymentMethod === "Online Payment"){

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
            return res.json({ success: false, message: "Invalid payment method" });
        }

        const order = new Order({
            userId: user,
            orderItems: orderItems,
            address: address,
            paymentMethod: paymentMethod,
            orderDate: new Date(),
            totalAmount: totalPrice,
            paymentStatus: paymentMethod === "Wallet" ? "Payment Completed" : "Pending",
        });

        const saveOrder = await order.save();

        await Cart.deleteOne({ userId: user });
        req.session.cartProduct = null;
        req.session.address_data = null;
        req.session.cartAllProduct = null;

        return res.json({ success: true, message: "Order placed successfully", order: saveOrder });

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

//retry payment in order page
const retryPayment = async(req,res)=>{
    try {
        const { orderId, itemId, totalPrice } = req.body

        const option = {
            amount: Math.round(totalPrice),
            currency: "INR",
            receipt: `order_rcption_${orderId}`,
            payment_capture: "1"
        }

        const razorpayOrder = await razorpayInstance.orders.create(option)

        return res.status(200).json({
            success: true,
            message:"Order Created ready for Payment",
            key_id: "rzp_test_FRaUz1vihG1Qvx",
            totalAmount:Math.round(totalPrice),
            orderedId: orderId,
            ItemId:itemId,
            razorpayOrderId:razorpayOrder._id
        });

    } catch (error) {
        console.log('Error in retryPayment:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred during the payment retry process."
        });
    }
}


//reVerify payment
const reVerificationPayment = async(req,res)=>{
    try {
        const { paymentId, orderId, itemId } = req.body

        const orderData = await Order.findOne({ _id:orderId })

        for(let i=0 ; i<orderData.orderItems.length ; i++){
            if (orderData.orderItems[i]._id.toString() === itemId) {
                orderData.orderItems[i].paymentStatus = "Payment Completed"
            }
        }

        await orderData.save();

        return res.status(200).json({
            success: true,
            message: "Order item Payment status updated successfully"
        });

    } catch (error) {
        console.log(error.message);
    }
}

//order success
const orderSuccessPage = async(req,res)=>{
    try {
        
        res.render('users/checkout/orderSuccess.ejs')

    } catch (error) {
        console.log(error.message);
    }
}

export {

    payment,
    verifyPayment,
    orderSuccessPage,

    retryPayment,
    reVerificationPayment
    
};
