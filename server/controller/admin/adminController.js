
import Admin from "../../model/adminModel.js";

// ----------------------------------------------

import Order from "../../model/orderModel.js";
import User from "../../model/userModel.js";
import Products from "../../model/productModel.js";
import Category from "../../model/categoryModel.js";
import { login } from "../user/userController.js";

// ----------------------------------------------

//admin login page
const adminLogin = async (req, res) => {
    try {
        res.render('admin/login.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

//admin register page
const adminRegister = async (req, res) => {
    try {
        res.render('admin/adminRegister.ejs');
    } catch (error) {
        console.log(error.message)
    }
}

//registration admin details
const insertAdmin = async (req, res) => {
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
    }
}

//verify admin login
const verifyAdminLogin = async (req, res) => {
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
        console.log(error.message)
    }
}

//admin home page
const adminHome = async (req, res) => {
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

        const statuses = ['Ordered', 'Shipped', 'Delivered', 'Canceled', 'Returned'];
        const counts = {};
      
        for (const status of statuses) {
          const countResult = await Order.aggregate([
            { $unwind: "$orderItems" },
            { $match: { 'orderItems.orderStatus': status } },
            { $count: "count" }
          ]);
      
          counts[status] = countResult[0]?.count || 0;
        }
      

        // console.log(orderedCount,'orderedcount');
        // console.log(shippedCount,'shipped count');
        // console.log(deliveredCount,'delivery count');
        // console.log(canceledCount,"cancel");
        // console.log(returnedCount,'returned count');


        res.render('admin/index.ejs',{
            admin: adminData,
            category: categoryCount,
            usersCount,
            orderCount,
            orderItemsCount,
            totalProducts,
            totalCategories,
            counts
        })
    } catch (error) {
        console.log(error.message)
    }
}

//top sales count
const topSales = async (req, res) => {
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
    }
}


//admin Logout
const adminLogout = async (req, res) => {
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

    topSales

};
