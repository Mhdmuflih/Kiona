import Order from "../model/orderModel.js";
import User from "../model/userModel.js";


//sales report page
const salesReportPage = async (req, res) => {
    try {
        const salesReport = await Order.aggregate([
            {
                $match: {
                    'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                    'orderItems.cancelReason': { $exists: false },
                    'orderItems.returnReason': { $exists: false }
                }
            },
        ]);

        const users = [];

        for (let i = 0; i < salesReport.length; i++) {
            const userId = salesReport[i].userId;
            const user = await User.findOne({ _id: userId });
            users.push(user);
        }

        console.log(users, 'user');

        const orderItems = [];

        for (let i = 0; i < users.length; i++) {
            const order = await Order.findOne({ userId: users[i]._id });
            for (let j = 0; j < order.orderItems.length; j++) {
                orderItems.push({
                    orderId: order._id,
                    address: order.address,
                    orderDate:order.orderDate,
                    orderItems:order.orderItems[j]
                    // productName: order.orderItems[j].productName,
                    // quantity: order.orderItems[j].cartQuantity,
                    // total: order.orderItems[j].totalPrice
                });
            }
        }

        res.render('admin/salesReport.ejs', { users, orderItems });
    } catch (error) {
        console.log(error.message);
    }
};


export{
    salesReportPage
}