import Product from "../model/productModel.js";

// product page
const productPage = async (req,res)=>{
    try {
        res.render('admin/Products/product.ejs')
    } catch (error) {
        console.log(error.message);
    }
}

// add product page
const addProduct = async(req,res)=>{
    try {
        res.render('admin/Products/addProduct.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

//add product
const productAdd = async(req,res)=>{
    console.log('hiiiii');
    console.log(req.file);
    try {

        console.log('kkkkk');
        const images = req.files.map((file)=>file.filename);
        console.log(images);

        const product = new Product({
            name:req.body.name,
            category:req.body.category,
            quantity:req.body.quantity,
            price:req.body.price,
            image:images,
            description:req.body.description
        })
        console.log('hlo');
        console.log(product);
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

export{
    productPage, addProduct, productAdd
}