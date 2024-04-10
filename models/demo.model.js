import { Schema, model } from "mongoose";




const demoSchema=new Schema({
    demos:[
        {
            title:String,
            description:String,
            demoVideo:{
                public_id:{
                type:String
                },
                secure_url:{
                type:String
                }
            }
        }
    ],
},{
    timestamps:true
})

const Demos=model('DemoVideo',demoSchema)


export default Demos;