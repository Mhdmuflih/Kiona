import Category from "../model/categoryModel.js";

// -----------------------------------------------------------------

//category page
const categoryPage = async(req,res)=>{
    try {

        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page
        }

        const limit = 4

        const categoryData = await Category.find({
            $and: [
                { delete: false },
                { $or:[
                    { name: { $regex: ".*" + search + ".*", $options: "i" } },
                    { email: { $regex: ".*" + search + ".*", $options: "i" } }
                ]}
            ]
        }).limit(limit*1)
        .skip((page - 1)* limit)
        .exec();

        const count = await Category.find({
            $or:[
                { name:{ $regex: ".*" + search + ".*", $options: "i" } },
                { email:{ $regex : ".*" + search + ".*", $options: "i" } }
            ]
        }).countDocuments();


        res.render('admin/Category/category.ejs',{
            category:categoryData,
            totalPages:Math.ceil(count/limit),
            currentPage:page
        })
    } catch (error) {
        console.log(error.message);
    }
}

//add category page
const addCategory = async (req,res)=>{
    try {
        res.render('admin/Category/addCategory.ejs');
    } catch (error) {
        res.status(404).json({message:error.message})
    }
}

//create Category
const createCategory = async (req, res) => {
    try {


        const image = req.file.filename
        const { categoryName, description } = req.body;
    
        console.log(categoryName,description,image);
        
        
        if (!categoryName || !description || !image) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        const category = new Category({
            image:image,
            name: categoryName,
            description: description
        });
        console.log(category);
        await category.save();
        res.status(201).json({ message: 'Category created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

//edit category page
const editCategoryPage = async (req,res)=>{
    try {

        const { id } = req.query;

        console.log(id);
        const category = await Category.findById({_id:id})
        console.log(category);

        if(category){
            res.render("admin/Category/editCategory.ejs", { category:category })
        }else{
            res.redirect("/admin/category");
        }

    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req,res)=>{
    try {

        const { id } = req.body
        console.log(id,'kfdsghjfkdjhgkfjsdhgkjdfhs');

        const response = await Category.findByIdAndUpdate({ _id:id }, { $set: { name: req.body.name, description: req.body.description } });

        console.log(response);

        if(response){
            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async(req,res)=>{
    try {

        const { id } = req.body

        const responce = await Category.updateOne( { _id:id },{ $set:{ delete:true } } )

        if(responce){
            res.json({ success:true, message:"Category delete" })
        }else{
            res.json({ success:false, message:"Server Error" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategoryPage = async(req,res)=>{
    try {

        const deletedCategory = await Category.find({delete:true})

        res.render("admin/Category/deletedCategory.ejs",{category:deletedCategory})
        
    } catch (error) {
        console.log(error.message);
    }
}

const restoreCategory = async (req,res)=>{
    try {
        
        const { id } = req.body

        const restore = await Category.updateOne({_id:id},{ $set:{ delete:false } })

        if(restore){
            res.json({ success:true, message:"Resotre Success" })
        }else{
            res.json({ success:false, message:"Server Error" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const categoryDeleted = async(req,res)=>{
    try {
        
        const { id } = req.body

        const responce = await Category.deleteOne({ _id:id })
        if(responce){
            res.json( { success:true, message:"Category Deleted successfull" } )
        }else{
            res.json( { success:false, message:"Category Delete Failed" } )
        }

    } catch (error) {
        console.log(error.message);
    }
}

export {
    categoryPage,
    addCategory,
    createCategory,
    editCategoryPage,
    editCategory,
    deleteCategory,
    deleteCategoryPage,
    restoreCategory,
    categoryDeleted
}