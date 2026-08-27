const mongoose  = require("mongoose")


const courseSchema =new mongoose.Schema({
    title : {
        type : String,
        require : true
    },
    price:{
        type : Number,
        require : true
    }
})

//wirete it in upper case and singler db will translation to plureler 
module.exports = mongoose.model('Course', courseSchema);