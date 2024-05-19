import {model,Schema} from 'mongoose'

const productSchema=new Schema(
    {
       productName:{
          type:String,
          required:true
       },
       price:{
        type:String,
        required:true
       } ,
       discount:{
        type:Number,
        required:true
       },
       category:{
        type:String,
        required:true
       },
       productImage:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String,
        }
      }
    },
    {
        timestamps:true
    }
)

const Product=model('Product',productSchema)

export default Product
