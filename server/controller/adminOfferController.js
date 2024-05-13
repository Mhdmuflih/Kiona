import CategoryOffer from "../model/categoryOfferModel.js";
import ProductOffer from "../model/productOfferModel.js";
import CouponOffer from "../model/couponModel.js";

import Category from "../model/categoryModel.js";
import Product from "../model/productModel.js";

// --------------------------------------------------------------



// category offer page
const categoryOfferPage = async(req,res)=>{
    try {
        const categoryOffer = await CategoryOffer.aggregate([
            { $lookup: {
                from:"categories",
                localField:"categoryId",
                foreignField:"_id",
                as:"categoryDetails"
            } }
        ])

        res.render('admin/Offers/categoryOffer.ejs', { categoryOffer });

    } catch (error) {
        console.log(error.message);
    }
}

//add Categoroy offer Page
const addCategoryOfferPage = async(req,res)=>{
    try {
        const category = await Category.find({ delete:false });
        res.render('admin/offers/addCategoryOffer.ejs', { category });
    } catch (error) {
        console.log(error.message);
    }
}

//add Category offer in post
const addCategoryOffer = async(req,res)=>{
    try {
        const { name, offer, date } = req.body

        const category = await Category.findOne({name:name})

        const categoryOffer = new CategoryOffer({
            categoryId:category._id,
            offer:offer,
            expaireDate:date
        })

        const categoryOfferData = await categoryOffer.save()

        if(categoryOfferData){
            res.json({ success:true, message:"Category offer Added Successfully." })
        }else{
            res.json({ success:false, message:"Failed to add Category offer. Please Try Again." })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//delete Category offer
const deleteCategoryOffer = async(req,res)=>{
    try {
        const { id } = req.body
        const response = await CategoryOffer.findOneAndDelete({ _id:id })
        if(response){
            res.json({ success:true, message:"Category Offer deleted" })
        }else{
            res.json({ success:false, message:"Category Offer is not delete. Please try again." })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//product offer page
const productOfferPage = async(req,res)=>{
    try {
        const productOffer = await ProductOffer.aggregate([
            { $lookup: {
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"productsDetails"
            } }
        ])
        res.render('admin/Offers/productOffer.ejs', { productOffer })
    } catch (error) {
        console.log(error.message);
    }
}

//add Product offer Page
const addProductOfferPage = async(req,res)=>{
    try {
        const product = await Product.find({ delete:false })
        res.render('admin/Offers/addProductOffer.ejs',{ product });
    } catch (error) {
        console.log(error.message);
    }
}

//add the procuct offer
const addProductOffer = async(req,res)=>{
    try {
        const { name, offer, date } = req.body

        const product = await Product.findOne({name:name})
        
        const productOffer = new ProductOffer({
            productId:product._id,
            offer:offer,
            expaireDate:date
        })

        const productOfferData = await productOffer.save();

        if(productOfferData){
            res.json({ success:true, message:"Product Offer added Successfully." })
        }else{
            res.json({ success:false, message:"Product Offer Added Failed. Please try Again!" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//delete Product Offer
const deleteProductOffer = async(req,res)=>{
    try {
        const { id } = req.body

        const response = await ProductOffer.findOneAndDelete({ _id:id })
        if(response){
            res.json({ success:true, message:"Product Offer Deleted." })
        }else{
            res.json({ success:false, message:"Product Offer is not Deleted. Please try Again! " })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//coupons Offer Page
const couponOfferPage = async(req,res)=>{
    try {
        const coupons = await CouponOffer.find()
        res.render('admin/Offers/coupon.ejs', { coupons });
    } catch (error) {
        console.log(error.message);
    }
}

//add coupon offer page
const addCouponOfferPage = async(req,res)=>{
    try {
        res.render('admin/Offers/addCoupon.ejs')
    } catch (error) {
        console.log(error.message);
    }
}

//add coupon in post
const addCoupon = async(req,res)=>{
    try {
        const { couponCode, offer, minAmount, date } = req.body

        const couponOffer = new CouponOffer({
            couponCode:couponCode,
            offer:offer,
            minAmount:minAmount,
            expaireDate:date
        })

        const couponOfferData = await couponOffer.save();

        if(couponOfferData){
            res.json({ success:true, message:"Coupon is Added." })
        }else{
            res.json({ success:false, message:"Coupon is not Added. Please try Again!" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//delete the coupon
const deleteCoupon = async(req,res)=>{
    try {
        const { id } = req.body
        const response = await CouponOffer.findOneAndDelete({ _id:id })
        if(response){
            res.json({ success:true, message:"Coupon Offer Deleted Successfully." })
        }else{
            res.json({ success:false, message:"Coupon offer is not Delete. Please try Again!" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

export{
    categoryOfferPage,
    addCategoryOfferPage,
    addCategoryOffer,
    deleteCategoryOffer,

    productOfferPage,
    addProductOfferPage,
    addProductOffer,
    deleteProductOffer,

    couponOfferPage,
    addCouponOfferPage,
    addCoupon,
    deleteCoupon

}