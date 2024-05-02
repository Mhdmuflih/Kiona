import Product from "../model/productModel.js";
import Category from "../model/categoryModel.js";

import fs from "fs";

// product page
const productPage = async (req,res)=>{
    try {
        
        var search = '';
    if(req.query.search){
        search = req.query.search;
    }

    var page = 1;
    if(req.query.page){
        page = req.query.page
    }

    const limit = 5

    const productData = await Product.find({
        $and: [
            { delete: false },
            { $or:[
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]}
        ]
    }).limit(limit*1)
    .skip((page - 1) * limit)
    .exec();

    const count = await Product.find({
        $and: [
            { delete: false },
            { $or:[
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]}
        ]
    }).countDocuments();

    res.render('admin/Products/product.ejs', {
        product: productData,
        totalPages: Math.ceil(count/limit),
        currentPage: page
    });

    } catch (error) {
        console.log(error.message);
    }
}

// add product page
const addProduct = async(req,res)=>{
    try {
        const category = await Category.find();
        console.log(category);
        res.render('admin/Products/addProduct.ejs',{category})
    } catch (error) {
        console.log(error.message)
    }
}

//add product
const productAdd = async(req,res)=>{
    try {

        const images = req.files.map((file)=>file.filename);

        const product = new Product({
            name:req.body.name,
            category:req.body.category,
            quantity:req.body.quantity,
            price:req.body.price,
            image:images,
            description:req.body.description
        })
        const productData = await product.save();
        if(productData){
            res.status(200).json({ success: true, message: 'Product added successfully.' });
        }else{
            res.status(400).json({ success: false, error: 'Failed to add product. Please try again.' });
        }
    
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: 'An error occurred while adding the product.' });
    }
}

//soft delete product
const deleteProduct = async (req,res)=>{
    try {
        const {id} = req.body
        const responce = await Product.updateOne({_id:id},{ $set:{ delete: true } })
        if(responce){
            res.json({success:true, message:"Product deleted"})
        }else{
            res.json({success:false, message:"Server Error"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//deleted product page
const deletedProductPage = async(req,res)=>{
    try {
        const deletedProduct = await Product.find({delete:true})
        res.render("admin/Products/deletedProduct.ejs",{product:deletedProduct})
    } catch (error) {
        console.log(error.message);
    }
}

//resote the product
const restoreProduct = async(req,res)=>{
    try {
        const {id} = req.body
        
        const restore = await Product.updateOne({_id:id},{ $set: { delete:false } })
        if(restore){
            res.json({success:true,message:"Restore success"})
        }else{
            res.json({ success:false,message:"Server Error" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//product delete the db.
const deleted = async(req,res)=>{

    try {
        const {id} = req.body

        const response = await Product.deleteOne({_id: id})
        if(response){
            res.json({success:true,message:"Product Deleted Success"})
        }else{
            res.json({success:false,message:"Product Delete Failed"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//edit product page
const editProductPage = async(req,res)=>{
    try {
        const id = req.query.id;
        const product = await Product.findOne({_id:id})
        const category = await Category.find();
        
        res.render("admin/Products/editProduct.ejs",{product, category})

    } catch (error) {
        console.log(error.message);
    }
}

//edit Product
const editProduct = async (req, res) => {
    try {

        let updatedProduct ;
        
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => file.filename); // Extract filenames from uploaded files
            console.log(newImages);

            const existingProduct = await Product.findById(req.body.product_id);
            const existingImages = existingProduct.image || [];

            const mergedImages = [...existingImages, ...newImages]

            updatedProduct = await Product.findByIdAndUpdate(
                { _id: req.body.product_id },
                {
                    $set: {
                        image: mergedImages,
                        name: req.body.name,
                        price: req.body.price,
                        quantity:req.body.quantity,
                        category: req.body.category,
                        description: req.body.description
                    }
                }
            );

        }else{
            updatedProduct = await Product.findByIdAndUpdate(
                { _id: req.body.product_id },
                {
                    $set: {
                        name: req.body.name,
                        price: req.body.price,
                        quantity:req.body.quantity,
                        category: req.body.category,
                        description: req.body.description
                    }
                }
            );
        }

        if (updatedProduct) {
            res.json({ success: true, message: "Product Updated" });
        } else {
            res.json({ success: false, message: "Product not found or update failed" });
        }
    } catch (error) {
        console.log(error.message);
    }
};


export{
    productPage,
    addProduct,
    productAdd,
    deleteProduct,
    deletedProductPage,
    restoreProduct,
    editProductPage,
    editProduct,
    deleted
}