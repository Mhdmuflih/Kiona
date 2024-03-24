const home = async (req,res)=>{
    try {
        res.render('users/index.ejs')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

export {
    home
}