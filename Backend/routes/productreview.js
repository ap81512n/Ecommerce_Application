import express  from 'express';
import { createProductReview, getProductReviews, deleteReview } from '../controllers/productreviewControllers.js';
import { isAuthenticatedUser,authorizeRoles } from '../middleware/auth.js';



const router = express.Router();

router.route('/reviews').put(isAuthenticatedUser, createProductReview);
router.route('/product/reviews/:id').get(isAuthenticatedUser, getProductReviews);
router.route("/products/:productId/reviews/:reviewId").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);


export default router;
// This code sets up an Express router for handling product review routes.
// It imports the necessary modules, defines a route for creating product reviews, and exports the router.
// The `createProductReview` function is expected to handle the logic for creating a product review when a POST request is made to the `/products/review` endpoint.
// The router is then exported for use in the main application file, allowing it to be mounted on a specific path in the Express app