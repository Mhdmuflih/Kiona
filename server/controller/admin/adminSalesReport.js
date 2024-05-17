import Order from "../../model/orderModel.js";
import User from "../../model/userModel.js";


//sales report page
const salesReportPage = async (req, res) => {
    try {

        const salesReport = await Order.aggregate([
            {
                $match: {
                    'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                }
            },
        ]);

        const users = [];

        for (let i = 0; i < salesReport.length; i++) {
            const userId = salesReport[i].userId;
            const user = await User.findOne({ _id: userId });
            users.push(user);
        }
        
        const orderItems = [];

        for (let i = 0; i < salesReport.length; i++) {
            let order = salesReport[i]
            for (let j = 0; j<order.orderItems.length ; j++) {
                orderItems.push({
                    orderUser:users[i].name,
                    orderId: order._id,
                    address: order.address,
                    orderDate:order.orderDate,
                    orderItems:order.orderItems[j]
                });
            }
        }

        res.render('admin/salesReport.ejs', { orderItems });
    } catch (error) {
        console.log(error.message);
    }
};

//take in dayly, weekly, monthly, yearly
const salesReport = async(req,res)=>{
    try {
        const { value } = req.body

        let salesReport

        const today = new Date();

        if( value == "Daily" ){
            // const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            console.log(today,'todaty');
            console.log(yesterday,'yeasterday');

            salesReport = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                        orderDate: { $gt: yesterday, $lte: today }
                    }
                }
            ]);
        }else if( value == "Weekly" ){

            const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            const lastWeekEnd = today;
            // const lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            salesReport = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                        orderDate: { $gt: lastWeekStart, $lte: lastWeekEnd }
                    }
                }
            ])
        }else if( value == "Monthly" ){

            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            salesReport = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                        orderDate: { $gt: firstDayOfMonth, $lte: lastDayOfMonth }
                    }
                }
            ]);
        }else if( value == "Yearly" ){

            const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
            const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

            salesReport = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                        orderDate: { $gt: firstDayOfYear, $lte: lastDayOfYear }
                    }
                }
            ])
        }

        const users = [];

        for (let i = 0; i < salesReport.length; i++) {
            const userId = salesReport[i].userId;
            const user = await User.findOne({ _id: userId });
            users.push(user);
        }
        
        const orderItems = [];

        for (let i = 0; i < salesReport.length; i++) {
            let order = salesReport[i]
            for (let j = 0; j<order.orderItems.length ; j++) {
                orderItems.push({
                    orderUser:users[i].name,
                    orderId: order._id,
                    address: order.address,
                    orderDate:order.orderDate,
                    orderItems:order.orderItems[j]
                });
            }
        }

        return res.json({success:true, orderItems})
    } catch (error) {
        console.log(error.message);
    }
}


export {
    salesReport,
    salesReportPage
};
