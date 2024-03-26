const home = async (req,res)=>{
    try {
        res.render('users/login.ejs')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

const login = async(req,res)=>{
    try {
        res.render('users/login.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

export {
    home,login
}