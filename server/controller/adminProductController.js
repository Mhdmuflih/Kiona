import Product from "../model/productModel.js";
import Category from "../model/categoryModel.js";

// product page
const productPage = async (req,res)=>{
    try {
        const product  = await Product.find({delete:false})
        res.render('admin/Products/product.ejs',{product})
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
            res.render('admin/Products/addProduct.ejs',{message:"ok"})
        }else{
            res.render('admin/Products/addProduct.ejs',{message:"no ok therth kalayum panniii"})
        }
    
        
    } catch (error) {
        console.log(error.message);
    }
}

//delete product
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

const deletedProductPage = async(req,res)=>{
    try {
        const deletedProduct = await Product.find({delete:true})
        res.render("admin/Products/deletedProduct.ejs",{product:deletedProduct})
    } catch (error) {
        console.log(error.message);
    }
}

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

const editProductPage = async(req,res)=>{
    try {
        const id = req.query.id;
        const product = await Product.findOne({_id:id})
        console.log(product);
        res.render("admin/Products/editProduct.ejs",{product})

    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async(req,res)=>{
    try {
        const id = req.query.id
        console.log(id)
        console.log(req.body);
    } catch (error) {
        console.log(error.message);
    }
}


export{
    productPage, addProduct, productAdd, deleteProduct, deletedProductPage, restoreProduct, editProductPage,editProduct
}