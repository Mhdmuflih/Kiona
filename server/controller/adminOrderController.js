//order Page
const orderPage = async(req,res)=>{
    try {
        
        res.render('admin/tables/basic-table.ejs')

    } catch (error) {
        console.log(error.message);
    }
}

export {
    orderPage
}