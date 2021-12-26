const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash')
const methodOverride = require('method-override')
const bodyparser = require('body-parser')
// const multer = require('multer')
const path=require('path')
const fs=require('fs')
const app = express()
require('dotenv').config()
const initializePassport = require('./passport-config')
const Admin = require('./models/Admin')
const Post = require('./models/Post')

initializePassport(
    passport,
    username => Admin.findOne({ username: username }),
    id => Admin.findOne({ _id: id })
)
//upload
// const filestorage = multer.diskStorage({
//     destination: (req, file, cb) => {
        

//         cb(null, "public/images")
//     },
//     filename: (req, file, cb) => {

//         cb(null, Date.now() + path.extname(file.originalname))
//     },


// })

// const fileUpload = multer({
//     storage: filestorage,
//     fileFilter: function (req, file, cb) {
//         var ext = path.extname(file.originalname)
        
       
//         cb(null, true)
//     }


// })


//middlewares
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//routes

//users
app.get('/', async(req, res) => {
    try{
        const posts= await Post.find()
        
        res.render('index',{
            posts
        })

    }catch(e){
        console.log(e)

    }
  
})

//admin
app.post('/admin', async (req, res) => {
    console.log(req.body)
    try {
        const newAdmin = new Admin({ ...req.body })
        await newAdmin.save()
        return res.status(200).json('admin created successfully')

    } catch (e) {
        console.log(e)
        return res.status(500).json('internal db error')
    }
})
app.post('/admin/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
    failureFlash: true
}))
app.get('/admin/logout',checkAuthenticated,(req,res)=>{
    req.logOut()
    res.redirect('/admin/login')
})
app.get('/admin/login', checkNotAuthenticated, (req, res) => {
    res.render('adminlogin')
})

app.get("/admin", checkAuthenticated, async(req, res) => {
    try{
        const posts= await Post.find()
        
        res.render('adminhome',{
            posts
        })

    }catch(e){
        console.log(e)

    }
   
})
app.post("/admin/post",checkAuthenticated,async (req, res) => {
    const link = `https://drive.google.com/uc?export=view&id=${req.body.img}`
    try{
         const newPost = new Post({
             title:req.body.title,
             desc:req.body.desc,
             img:link
         })
         await newPost.save()
         res.redirect('back')
    }catch(e){
        console.log(e)
    }
})
app.delete("/admin/post/:id",checkAuthenticated,async(req,res)=>{
    try{
        const post = await Post.findByIdAndDelete(req.params.id)
   
        res.redirect('back')
       

    }catch(e){
        console.log(e)
    }
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/admin/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin')
    }
    next()
}
mongoose.connect(process.env.MONGOOSE_URI).then(resp => {
    console.log('mongoose connected successfully')
}).catch(e => console.log(e))
app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening on port ${process.env.PORT}`)
})