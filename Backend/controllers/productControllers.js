import catchasyncErrors from '../middleware/catchasyncError.js';
import Product from '../models/product.js';
import APIFilters from '../utils/apiFilters.js';
import ErrorHandler from '../utils/errorHandler.js';
import erroHandler from '../utils/errorHandler.js';
import qs from 'qs';


//Create new product /api/v1/product
export const getProduct = async(req,res,next) =>{

    const resPerPage = 4;
    const parsedQuery = qs.parse(req.query);
    const apiFilters = new APIFilters(Product.find(), parsedQuery).search().filter();

    console.log("req.user", req.user);

     

    let products = await apiFilters.query;
    let filteredProductsCount = products.length;
    


    apiFilters.pagination(resPerPage);
    products = await apiFilters.query.clone();
    
    //const products = await Product.find();

    res.status(200).json({
       
        
        filteredProductsCount,
        resPerPage,
        products,
        
        
    })
}


//Create new product /api/v1/admin/product
export const newProduct = catchasyncErrors (async(req,res) =>{
   
    req.body.user = req.user.id; // Set the user who created the product
    const product =  await Product.create(req.body);



    res.status(200).json({
        success: true,
        product,
        message: "Product created successfully",
    })
});

// get single product by id /api/v1/product/:id
export const getProductDetails = catchasyncErrors(async (req,res,next) =>{
   
    const product =  await Product.findById(req.params.id);
    if (!product){
        return next(new erroHandler(`Product not found with id: ${req.params.id}`, 404));
        // return res.status(404).json({
        //     success: false,
        //     message: "Product not found",
        // });
    }

    res.status(200).json({
        success: true,
        product,
        message: "Product retrived successfully by Id",
    })
});

// Update product by id /api/v1/admin/product/:id
export const updateProductDetails = catchasyncErrors (async(req,res) =>{
   
    let product =  await Product.findById(req.params.id);
    if (!product){
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})

    res.status(200).json({
        success: true,
        product,
        message: "Product updated successfully",
    })
});

export const deleteProduct = catchasyncErrors (async(req,res) =>{
   
    let product =  await Product.findById(req.params.id);
    if (!product){
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    product = await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    })
});