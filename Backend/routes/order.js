
import express from 'express';
import { isAuthenticatedUser, authorizeRoles  } from '../middleware/auth.js';
import { createOrder, getOrderDetails,getAllOrdersOfCurrentUser, updateOrder, deleteOrder } from '../controllers/orderControllers.js';

const router = express.Router();


router.route('/order/new').post(isAuthenticatedUser, createOrder);
router.route('/order/getdetails/:id').get(isAuthenticatedUser, getOrderDetails);
router.route('/order/all/me').get(isAuthenticatedUser, getAllOrdersOfCurrentUser);
router.route('/admin/order').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrdersOfCurrentUser);
router.route('/admin/order/update/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
router.route('/admin/order/delete/:id').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteOrder );




export default router;