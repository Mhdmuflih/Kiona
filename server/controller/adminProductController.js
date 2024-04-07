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
        
        res.render("admin/Products/editProduct.ejs",{product})

    } catch (error) {
        console.log(error.message);
    }
}

//edit Product
const editProduct = async (req, res) => {
    try {
        const id = req.query.id;

        const updatedProduct = await Product.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    image: req.body.image,
                    name: req.body.name,
                    price: req.body.price,
                    category: req.body.category,
                    description: req.body.description
                }
            }
        );

        if (updatedProduct) {
            res.json({ success: true, message: "Product Updated" });
        } else {
            res.status(400).json({ success: false, message: "Product not found or update failed" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



export{
    productPage, addProduct, productAdd, deleteProduct, deletedProductPage, restoreProduct, editProductPage, editProduct, deleted
}