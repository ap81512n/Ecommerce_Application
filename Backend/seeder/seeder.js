import mongoose from "mongoose";
import Product from "../models/product.js";
import products from "./data.js"; // Importing the products data from data.js
// Function to seed products into the database

const seedProducts = async() =>  {
    try{
        await mongoose.connect("mongodb://localhost:27017/EcommerceApp")

        await Product.deleteMany(); // Clear existing products
        console.log("Existing products cleared");

        await Product.insertMany(products)
        console.log("Products are added successfully");

        process.exit(); // Exit the process after seeding

    }
    catch (error){
        console.error(error.message);
        process.exit(); // Exit the process with failure

    }

};

// Call the seedProducts function to start the seeding process
seedProducts();

