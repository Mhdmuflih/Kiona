import bcrypt from "bcrypt";
import Mailgen from "mailgen";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

// ----------------------------------------------

import Cart from "../../model/cartModel.js";
import Category from "../../model/categoryModel.js";
import OTP from "../../model/otpModel.js";
import Product from "../../model/productModel.js";
import User from "../../model/userModel.js";
import Wishlist from "../../model/wishlistModel.js";
// ----------------------------------------------

import CategoryOffer from "../../model/categoryOfferModel.js";
import ProductOffer from "../../model/productOfferModel.js";

// ----------------------------------------------

// password secure
const securePassword = async (password) => {
    try {
        const passwordHarsh = await bcrypt.hash(password, 10);
        console.log(`Hash Password ${passwordHarsh}`)
        return passwordHarsh
    } catch (error) {
        console.log(error.message);
        next(error.message)
        throw error;
    }
}

// otp generator
const OtpGenerator = () => {
    return Math.floor(1000 + Math.random() * 9000)
}

// otp send to mail
const sendOtp = async (req, res, next) => {

    let otp = OtpGenerator();    //otp taken
    console.log(otp, " first send otp ");

    const transporter = nodemailer.createTransport({     // transporter
        service: "gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    })

    const MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Kiona",
            link: "http://mailgen.js/"
        }
    })

    const response = {                            // responce of mail
        body: {
            name: req.session.email,
            intro: 'Your OTP for KIONA Verification is:',
            table: {
                data: [
                    {
                        OTP: otp
                    }
                ]
            },
            outro: "looking forward to doing more Business"
        }
    }

    const mail = MailGenerator.generate(response)

    const message = {                             // message sent in the email
        from: process.env.AUTH_EMAIL,
        to: req.session.email,
        subject: 'KIONA otp Verification',
        html: mail
    }

    try {                      // otp save in db and send mail
        const newOtp = new OTP({
            email: req.session.email,
            OTP: otp,
            createdAt: Date.now(),
            expaireAt: Date.now() + 60000
        })
        const data = await newOtp.save()
        console.log(data, 'its data from otp');
        req.session.otpId = data._id
        await transporter.sendMail(message)
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


// user registration page
const register = async (req, res, next) => {
    try {
        res.render('users/registration.ejs')
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

// user input
const insertUser = async (req, res, next) => {
    try {

        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email })
            if (existingUser) {
                return res.json({ success: false, message: 'Already existing this Email.' })
            }
        }

        req.session.email = req.body.email

        const password = req.body.password
        const sPassword = await securePassword(password)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
            password: sPassword,
            is_block: 0,
            is_verified: 1,
            is_admin: 0
        })

        req.session.userData = user
        console.log(req.session.userData, 'this is session user data')

        const existingOtp = await OTP.findOne({
            email: req.body.email,
            expaireAt: { $gt: Date.now() } // Find OTPs that haven't expired yet
        });

        if (!existingOtp) {
            await sendOtp(req, res, next);
        } else {
            console.log('OTP already sent, waiting for expiration');
        }

        // await sendOtp(req, res, next)
        return res.json({ success: true })

    } catch (error) {
        console.log(error.message);
        next(error.message)

    }
}

// otp page
const otp = async (req, res, next) => {
    try {
        const message = req.query.message
        res.render('users/otp-verification.ejs', { message })
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}



// re - send otp fucntion
const resendOTP = async (req, res, next) => {
    try {
        let otp = OtpGenerator()
        console.log(otp);

        if (!req.session.email) {
            throw new Error("Recipient email not found in session.");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            }
        });

        const MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Kiona",
                link: "http://mailgen.js/"
            }
        });

        const response = {
            body: {
                name: req.session.email,
                intro: 'Your OTP for KIONA Verification is:',
                table: {
                    data: [{
                        OTP: otp
                    }]
                },
                outro: "looking forward to doing more Business"
            }
        };

        const mail = MailGenerator.generate(response);

        const message = {
            from: process.env.AUTH_EMAIL,
            to: req.session.email, // Set recipient email
            subject: 'KIONA re-send OTP Verification',
            html: mail
        };

        await OTP.updateOne({
            email: req.session.email
        }, {
            $set: { OTP: otp }
        })


        await transporter.sendMail(message);

        res.send({ success: true }); // Sending success response
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error: error.message });
    }
};

// verify Mail
const verifyOtp = async (req, res, next) => {
    try {

        const { otp } = req.body
        // const otp = [otp1, otp2, otp3, otp4].join('')
        console.log(otp)

        const otpData = await OTP.findOne({ email: req.session.email })
        console.log(otpData)

        if (!otpData) {
            return res.json({ success: false })
        }

        if (otpData.OTP == otp) {
            const userData = new User(req.session.userData)

            console.log(userData);
            await userData.save()

            await OTP.deleteMany({ email: req.session.email })
            return res.json({ success: true })
        } else {
            return res.redirect('/otp?message=invalid');
        }
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}


// login user page
const login = async (req, res, next) => {
    try {
        const message = req.query.message
        res.render('users/login.ejs', { message })
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

// verify login page
const verifyLogin = async (req, res, next) => {
    try {

        const { email, password } = req.body
        console.log(req.body)

        const userData = await User.findOne({ email })

        if (!userData) {
            res.render('users/login.ejs', {
                message: "Email ID and Password incorrect"
            })
        }

        if (userData.is_block) {
            return res.render('users/login.ejs', {
                message: "User is blocked by Admin",
                userBlocked: true
            });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (!passwordMatch) {
            return res.render('users/login.ejs', {
                message: "user email id and password incorrect"
            });
        }

        if (userData.is_verified === 0) {
            return res.render('users/login.ejs', {
                message: "Please verify Your email address to login."
            })
        }

        req.session.user_id = userData._id;
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//forgot password page
const forgotPasswordPage = async (req, res) => {
    try {
        res.render('users/forgot.ejs');
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//forgot password
const forgotPassword = async (req, res) => {
    try {

        let otp = OtpGenerator()
        console.log(otp, 'forgot otp');

        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        req.session.email = email

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            }
        });

        const MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Kiona",
                link: "http://mailgen.js/"
            }
        });

        const response = {
            body: {
                name: email,
                intro: 'Your OTP for KIONA Verification is:',
                table: {
                    data: [{
                        OTP: otp
                    }]
                },
                outro: "looking forward to doing more Business"
            }
        };

        const mail = MailGenerator.generate(response);

        const message = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'KIONA Forgot Password OTP Verification',
            html: mail
        };

        const newOtp = new OTP({
            email: email,
            OTP: otp,
            createdAt: Date.now(),
            expaireAt: Date.now() + 60000
        })

        await newOtp.save()
        await transporter.sendMail(message);

        // req.session.forgotuser = user
        res.json({ success: true })

    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//forgot otp page
const forgotOtpPage = async (req, res) => {
    try {
        const message = req.query.message
        res.render('users/forgotOtp.ejs', { message })
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//fprgot otp verification
const forgotOtpVerification = async (req, res) => {
    try {

        const { otp } = req.body
        const email = req.session.email;

        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired. Please try again." });
        }

        const otpData = await OTP.findOne({ email: req.session.email })

        if (!otpData) {
            return res.status(404).json({ success: false, message: "OTP not found. Please request a new OTP." });
        }

        if (otpData.OTP == otp) {
            await OTP.deleteMany({ email: req.session.email })
            return res.json({ success: true, message: "OTP verified successfully." });
        } else {
            return res.redirect('/otp?message=invalid');
        }

    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

// reset password page
const resetPasswordPage = async (req, res) => {
    try {
        res.render('users/resetPassword.ejs')
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}

//reset Password in user
const resetPassword = async (req, res) => {
    try {
        const email = req.session.email;
        const { password, conformPassword } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired. Please try again." });
        }


        if (password === conformPassword) {
            const sPassword = await securePassword(password)
            const response = await User.findOneAndUpdate({ email: email }, { $set: { password: sPassword } })

            if (response) {
                return res.json({ success: true, message: "You'r Password Changed." })
            } else {
                return res.json({ success: false, message: "You'r password is not Changed .Please Try Again!" })
            }

        } else {
            res.json({ success: false, message: "You'r Password is not Match" })
        }
    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}


//login Home
const loginHome = async (req, res, next) => {
    try {
        // const id = req.session.user_id
        const user = req.session.user_id


        const productOffers = await ProductOffer.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ]);


        const categoryOffers = await CategoryOffer.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            }
        ]);

        if (categoryOffers) {
            const products = await Product.find({ delete: false });
            for (let i = 0; i < products.length; i++) {
                const product = products[i];

                const matchingCategoryOffer = categoryOffers.find(
                    offer => offer.categoryDetails.name === product.category
                );

                if (matchingCategoryOffer) {

                    const discountRate = matchingCategoryOffer.offer / 100;
                    const discountAmount = product.price * discountRate;
                    const newOfferPrice = product.price - discountAmount;

                    await Product.updateOne(
                        { _id: product._id },
                        { $set: { offerPrice: Math.round(newOfferPrice), offer: matchingCategoryOffer.offer } }
                    );
                }
            }
        }


        for (let i = 0; i < productOffers.length; i++) {
            const productOffer = productOffers[i];
            const categoryName = productOffer.productDetails[0].category;
            const category = await Category.findOne({ name: categoryName });

            if (category) {
                const categoryOffer = await CategoryOffer.findOne({ categoryId: category._id });

                let offerPrice = productOffer.productDetails[0].price;

                if (productOffer.offer) {
                    const discountRateProduct = productOffer.offer / 100;
                    const discountAmountProduct = productOffer.productDetails[0].price * discountRateProduct;
                    offerPrice -= discountAmountProduct;
                }

                let categoryOfferPrice = productOffer.productDetails[0].price;

                if (categoryOffer) {
                    const discountRateCategory = categoryOffer.offer / 100;
                    const discountAmountCategory = productOffer.productDetails[0].price * discountRateCategory;
                    categoryOfferPrice -= discountAmountCategory;
                }

                const greaterOffer = Math.max(productOffer.offer || 0, (categoryOffer ? categoryOffer.offer : 0));

                await Product.updateOne(
                    { _id: productOffer.productDetails[0]._id },
                    { $set: { offerPrice: Math.round(Math.min(offerPrice, categoryOfferPrice)), offer: greaterOffer } }
                );
            }
        }


        const userData = await User.findById(user)
        const products = await Product.find({ delete: false })

        let cartProduct = await Cart.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$cartItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "cartItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ])

        let wishlistProduct = await Wishlist.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$wishlistItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "wishlistItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ])

        res.render('users/index.ejs', { user: userData || 'muflih', products, user, cartProduct, wishlistProduct })
    } catch (error) {
        console.log(error.message);
        next(error.message)
        res.status(500).send("Internal server error");
    }
}

// user all product page
const productPage = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const search = req.query.search || '';


        let sort = {};
        let filter = { delete: false };

        switch (req.query.sort) {
            case 'low_to_high':
                sort.price = 1;
                break;
            case 'high_to_low':
                sort.price = -1;
                break;
            case 'offer_low_to_high':
                sort.offerprice = 1;
                break;
            case 'offer_high_to_low':
                sort.offerprice = -1;
                break;
            case 'shirt':
                filter.category = "Shirt";
                break;
            case 't_shirt':
                filter.category = "T-Shirt";
                break;
        }

        // Search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 8; // Default to 10 items per page
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();


        const cartProduct = await Cart.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$cartItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "cartItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $match: { 'productDetails.delete': false }
            }
        ]);

        const wishlistProduct = await Wishlist.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$wishlistItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "wishlistItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        res.render('users/product.ejs', {
            user,
            products,
            cartProduct,
            wishlistProduct,
            search,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            limit
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
        next(error.message)
    }
};



//user single product details page
const productDetails = async (req, res, next) => {
    try {

        const { productId } = req.query
        const user = req.session.user_id

        if (!productId) {
            return res.status(400).render('error', { message: 'Product ID is required' });
        }

        const product = await Product.findOne({ _id: productId })

        let cartProduct = await Cart.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$cartItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "cartItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ])

        let wishlistProduct = await Wishlist.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(user) } },
            { $unwind: "$wishlistItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "wishlistItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ])

        res.render('users/product-detail.ejs', { user, product, cartProduct, wishlistProduct })

    } catch (error) {
        console.log(error.message);
        next(error.message)
    }
}


//user logout
const userLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.redirect('/'); // Redirect or handle the error as needed
        } else {
            res.redirect('/');
        }
    });
};


export {
    forgotOtpPage,
    forgotOtpVerification,
    forgotPassword,
    forgotPasswordPage,
    insertUser,
    login,
    loginHome,
    otp,
    productDetails,
    productPage,
    register,
    resendOTP,
    resetPassword,
    resetPasswordPage,
    userLogout,
    verifyLogin,
    verifyOtp,

};
