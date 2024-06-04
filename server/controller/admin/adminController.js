
import Admin from "../../model/adminModel.js";

// ----------------------------------------------

import Order from "../../model/orderModel.js";
import User from "../../model/userModel.js";
import Products from "../../model/productModel.js";
import Category from "../../model/categoryModel.js";
import { login } from "../user/userController.js";

// ----------------------------------------------

//admin login page
const adminLogin = async (req, res, next) => {
    try {
        res.render('admin/login.ejs')
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//admin register page
const adminRegister = async (req, res, next) => {
    try {
        res.render('admin/adminRegister.ejs');
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//registration admin details
const insertAdmin = async (req, res, next) => {
    try {
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        console.log(admin);

        await admin.save();
        res.redirect('/admin')


    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//verify admin login
const verifyAdminLogin = async (req, res, next) => {
    try {

        const { email, password } = req.body

        const adminData = await Admin.findOne({ email: email })

        if (adminData) {
            if (adminData.email === email && adminData.password === password) {
                req.session.admin_id = adminData._id
                res.redirect('/admin/home')
            } else {
                res.render('admin/login.ejs', { error: "invalid username and password" })
            }
        } else {
            console.log('no user data');
            res.render('admin/login.ejs');
        }

    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//admin home page
const adminHome = async (req, res, next) => {
    try {

        const adminData = await Admin.findById({ _id: req.session.admin_id });

        //this is count of salling category
        const categoryCount = await Order.aggregate([
            {
                $match: {
                    'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                }
            },
            {
                $unwind: '$orderItems'
            },
            {
                $group: {
                    _id: '$orderItems.category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        //total users count
        const usersCount = await User.countDocuments();

        //total order count
        const orderCount = await Order.aggregate([
            {
              $match: {
                'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
              }
            },
            {
              $count: "totalOrders"
            }
        ]);

        //product count. it means orderItems count
        const orderItemsCount = await Order.aggregate([
            {
              $unwind: '$orderItems'
            },
            {
              $match: {
                'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
              }
            },
            {
              $count: "totalOrderItems"
            }
        ]);

        //total Products
        const totalProducts = await Products.countDocuments({ delete: false });

        //total Category
        const totalCategories = await Category.countDocuments({ delete: false });

        //traffic chart data. all order status count
        const statuses = ['Ordered', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        const counts = {};
      
        for (const status of statuses) {
          const countResult = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { 'orderItems.orderStatus': status } },
            { $count: "count" }
          ]);
      
          counts[status] = countResult[0]?.count || 0;
        }

        //sales amount in using graph
        const today = new Date();
        const weeklySales = [];

        for (let i = 0; i < 4; i++) {
            const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (7 * (i + 1)));
            const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (7 * i) - 1);

            const weeklyTotalResults = await Order.aggregate([
                { $match: { orderDate: { $gte: startOfWeek, $lte: endOfWeek } } },
                { $unwind: "$orderItems" },
                { $match: { 'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] } } },
                {
                    $group: {
                        _id: null,
                        totalPrice: {
                            $sum: {
                                $cond: {
                                    if: "$orderItems.offerPrice",
                                    then: "$orderItems.offerPrice",
                                    else: "$orderItems.productPrice"
                                }
                            }
                        }
                    }
                }
            ]);

            const totalOrderPriceWeekly = weeklyTotalResults.length > 0 ? weeklyTotalResults[0].totalPrice : 0;
            weeklySales.push(totalOrderPriceWeekly);
        }

        // Calculate monthly sales for the last 12 months
        const monthlySales = [];
        
        for (let i = 0; i < 12; i++) {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

            const monthlyTotalResults = await Order.aggregate([
                { $match: { orderDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
                { $unwind: "$orderItems" },
                { $match: { 'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] } } },
                {
                    $group: {
                        _id: null,
                        totalPrice: {
                            $sum: {
                                $cond: {
                                    if: "$orderItems.offerPrice",
                                    then: "$orderItems.offerPrice",
                                    else: "$orderItems.productPrice"
                                }
                            }
                        }
                    }
                }
            ]);

            const totalOrderPriceMonthly = monthlyTotalResults.length > 0 ? monthlyTotalResults[0].totalPrice : 0;
            monthlySales.push(totalOrderPriceMonthly);
        }
        
        res.render('admin/index.ejs',{
            admin: adminData,
            category: categoryCount,
            usersCount,
            orderCount,
            orderItemsCount,
            totalProducts,
            totalCategories,
            counts,
            weeklySales,
            monthlySales
        })
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}


//top sales count
const topSales = async (req, res, next) => {
    try {
        const { value } = req.body

        if (value === "Category") {

            const categoryCount = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                    }
                },
                {
                    $unwind: '$orderItems'
                },
                {
                    $group: {
                        _id: '$orderItems.category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            return res.json({ success: true, category: categoryCount });

        } else if (value === "Product") {
            const productCount = await Order.aggregate([
                {
                    $match: {
                        'orderItems.orderStatus': { $in: ['Ordered', 'Shipped', 'Delivered'] },
                    }
                },
                {
                    $unwind: '$orderItems'
                },
                {
                    $group: {
                        _id: '$orderItems.productName',
                        count: { $sum: '$orderItems.cartQuantity' }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            return res.json({ success: true, product: productCount });

        } else {
            return res.status(400).json({ success: false, message: 'Invalid value' });
        }

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


//admin Logout
const adminLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            res.redirect('/admin/home')
        } else {
            res.redirect('/admin/logout')
        }
    })
}



// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------





export {
    adminHome,
    adminLogin,
    adminLogout,
    adminRegister,
    insertAdmin,
    verifyAdminLogin,

    topSales,

};
