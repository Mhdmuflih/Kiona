const adminHome = async (req,res)=>{
    try {
        res.render('admin/index.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

const userDetails = async (req,res)=>{
    try {
        res.render('admin/userDetails.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

export {
    adminHome,userDetails
}