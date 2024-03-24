import {model,Schema} from 'mongoose'

const couseSchema=new Schema({
    title:{
        type:String,
        required:[true,"Title is Required"],
        minLength:[8,"Title must be alteast 8 characters"],
        maxLength:[60,'Title must be less than 61 character'],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Title is Required"],
        minLength:[8,"Title must be alteast 8 characters"],
        maxLength:[200,'Title must be less than 200 character'],
        trim:true
    },
    category:{
        type:String,
        required:true
    },
    thumbnail:{
        public_id:{
            type:String,
            // required:true
           
        },
        secure_url:{
            type:String,
            // required:true
        }
    },
    lectures:[
        {
            title:String,
            description:String,
            lecture:{
                public_id:{
                type:String
                },
                secure_url:{
                type:String
                }
            }
        }
    ],
    numberOfLecture:{
        type:Number,
        default:0
    },
    createdBy:{
        type:String,
        required:true
    }

},{
    timestamps:true
}
)

const Course=model('Course',couseSchema)


export default Course