import Category from "../model/categoryModel.js";


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

        const limit = 3

        const categoryData = await Category.find({
            $or:[
                { name:{ $regex: ".*" + search + ".*", $options: "i" } },
                { email:{ $regex: ".*" + search + ".*", $options: "i" } }
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

const addCategory = async (req,res)=>{
    try {
        res.render('admin/Category/addCategory.ejs');
    } catch (error) {
        res.status(404).json({message:error.message})
    }
}

const createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        console.log(categoryName);
        
        if (!categoryName || !description) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        const category = new Category({
            name: categoryName,
            description: description
        });

        await category.save();
        res.status(201).json({ message: 'Category created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// const listCategory = async(req,res)=>{
//     try {
//         const categories = await Category.find();
//         res.status(200).json(categories)
//     } catch (error) {
//         res.status(404).json({message:error.message})
//     }
// }


export {
    categoryPage, addCategory, createCategory
}