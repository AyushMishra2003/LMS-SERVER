import {model,Schema} from 'mongoose'


const payementSchema=new Schema({
  
     razorpay_payement_id:{
        type:String,
        required:true
     },

     razorpay_subscription_id:{
        type:String,
        required:true
     },
     razorpay_signature:{
        type:String,
        required:true
     }

},{
    timestamps:true
})

const Payement=model('Payment',payementSchema)


export default Payement