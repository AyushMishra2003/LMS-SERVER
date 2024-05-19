import Product from "../models/product.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'


const addProduct=async(req,res,next)=>{
try{    
   const {productName,price,discount,category}=req.body

   console.log(req.body);
   if(!productName  || !price || !discount || !category ){
    return next(new AppError("All Field are Required",400))
   }
   
   const product=await Product.create({
       productName,
       price,
       discount,
       category,
       productImage:{
           public_id:'',
          secure_url:''
       },
   })

   if(!product){
    return next(new AppError("Product not found",400))
   }
   if(req.file){
    const result=await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms'
    })
    if(result){
        product.productImage.public_id=result.public_id,
        product.productImage.secure_url=result.secure_url
    }
    fs.rm(`uploads/${req.file.filename}`)
  }

  await product.save()
  
  return res.status(200).json({
    success:true,
    message:"Product Added Successfully",
    product
  })
}catch(error){
    return next(new AppError(e.message,500))
}
}


const getProduct=async(req,res,next)=>{
try{

   const allProduct=await Product.find({})

   if(!allProduct){
    return next(new AppError("Product not Found",400))
   }

   res.status(200).json({
    success:true,
    message:"All Product are: ",
    allProduct
   })

}catch(error){
    return next(new AppError(error.message,500))
}
}


const deleteProduct=async(req,res,next)=>{
try{
    
    const {id}=req.params

    const product= await Product.findById(id)

    if(!product){
        return next(new AppError("Product not Found",400))
    } 
    
    await Product.findByIdAndDelete(id)

    res.status(200).json({
        sucess:true,
        message:"Product Delete Successfully",
        product   
    })

}catch(error){
    return next(new AppError(error?.message,500))
}
}

const updateProduct=async(req,res,next)=>{
 try{   
 
   const {id}=req.params
  
   const {productName,price,discount,category}=req.body

   const product=await Product.findById(id)

   if((!product)){
    return next(new AppError("Product Not Found",400))
   }
   
   if(req.file){
    const result=await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms'
    })
    if(result){
        product.productImage.public_id=result.public_id,
        product.productImage.secure_url=result.secure_url
    }
    fs.rm(`uploads/${req.file.filename}`)
  }

  product.productName=productName
  product.price=price
  product.discount=discount
  product.category=category

  await product.save()

  res.status(200).json({
    success:true,
    message:"Product Update Sucessfully",
    product
  })

}catch(error){
    return next(new AppError(error.message,500))
}
}


export {
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct
}