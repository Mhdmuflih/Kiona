import express from "express";
import multer from "multer";
import path from "path";
import session from "express-session";

// import multer from "../service/prodectMulter.js";

import { adminHome, adminLogin, adminRegister, insertAdmin, verifyAdminLogin } from "../controller/adminController.js";
import { productPage, addProduct, productAdd, deleteProduct, deletedProductPage, restoreProduct, editProduct, editProductPage } from "../controller/adminProductController.js";
import { userDetails, userBlock } from "../controller/adminUserController.js";
import { addCategory, categoryPage, createCategory } from "../controller/adminCategoryController.js";

// ------------------------------------------------------------------------------------------------------------------

const admin_route = express();
// -----------------------------

const __dirname = path.resolve();

admin_route.use(session({
    secret:'allisWell',
    resave:false,
    saveUninitialized:false
}))

admin_route.use(express.static('assets'))

// -----------------------------------------------------------------------
//image storing in using multer product

const store = multer.diskStorage({

    destination:function(req,file,cb){
        console.log(file)
        cb(null,path.join(__dirname, 'assets/Photos/product'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})

const upload = multer({ storage: store }).array('images', 5);
// -----------------------------------------------------------------------

// storage photo in category
const storageCategory = multer.diskStorage({
    destination: function(req, file, callback) {
        console.log(file);
        callback(null, path.join(__dirname, 'assets/Photos/category'));
    },
    filename: function(req, file, callback) {
        const name = Date.now() + "-" + file.originalname;
        callback(null, name);
    }
});

const uploadCategory = multer({ storage: storageCategory });


//admin login
admin_route.get('/',adminLogin)
admin_route.post('/',verifyAdminLogin)

//admin register
admin_route.get('/register',adminRegister)
admin_route.post('/register',insertAdmin)

admin_route.get('/home',adminHome)

//admin user management
admin_route.get('/users',userDetails);
admin_route.post('/users/block',userBlock)       //post method is using axiox in back end

//product management
admin_route.get('/product',productPage)
admin_route.get('/add_product', addProduct)   // Add product
admin_route.post('/add_product',upload , productAdd)         //product adding using post

//category management
admin_route.get('/category',categoryPage)
admin_route.get('/add_category',addCategory)
admin_route.post('/add_category', uploadCategory.single('image'),createCategory)

admin_route.post('/product/delete', deleteProduct)

admin_route.get('/deletedProduct',deletedProductPage)

admin_route.post('/product/restore',restoreProduct)

admin_route.get('/editProduct',editProductPage)
admin_route.post('/editProduct',upload,editProduct)

export default admin_route;