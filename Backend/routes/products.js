import express  from 'express';
import { deleteProduct, getProduct, getProductDetails } from '../controllers/productControllers.js';
import { newProduct } from '../controllers/productControllers.js';
import { updateProductDetails } from '../controllers/productControllers.js';
import { isAuthenticatedUser,authorizeRoles } from '../middleware/auth.js';


const router = express.Router();


router.route('/products').get(getProduct);

router.route('/admin/products').post(isAuthenticatedUser, authorizeRoles('admin'),newProduct);
router.route('/products/:id').get(getProductDetails);
router.route('/admin/products/:id').put(isAuthenticatedUser, authorizeRoles('admin'),updateProductDetails);
router.route('/admin/products/:id').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteProduct);


export default router;
// This code sets up an Express router for handling product-related routes.
// It imports the necessary modules, defines a route for fetching products, and exports the router.
// The `getProduct` function is expected to handle the logic for fetching products when a GET request is made to the `/products` endpoint.
// The router is then exported for use in the main application file, allowing it to be mounted on a specific path in the Express app.
