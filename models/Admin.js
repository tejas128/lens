const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')

const adminSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }

},{
    timestamps:true
})

adminSchema.pre('save',async function (next){
    const user=this;
    const hash=await bcrypt.hash(this.password,10)
    this.password=hash
    next()

})

module.exports= mongoose.model('Admin',adminSchema)