const adminHome = async (req,res)=>{
    try {
        res.render('admin/index.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

const userDetails = async (req,res)=>{
    try {
        res.render('admin/UserDetails/users.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

export {
    adminHome,userDetails
}