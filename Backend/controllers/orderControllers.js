import catchAsyncErrors from '../middleware/catchasyncError.js';
import Order from '../models/order.js';
import sendToken from '../utils/sendToken.js';
import {resetPasswordEmailTemplate} from '../utils/emailTemplates.js';
import ErrorHandler from '../utils/errorHandler.js';

//create order
export const createOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
    } = req.body;

    if (orderItems.length === 0) {
        return next(new ErrorHandler('No order items found', 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id,
    });

    res.status(200).json({
        success: true,
        order,
    });
});





//write a function to get order details by order id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler('Order not found with this id', 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

//write a function to get all orders of a user
export const getAllOrdersOfCurrentUser = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        orders,
    });
});

//write a function to get all orders - ADMIN
export const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalAmount;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

//update/process order  - ADMIN
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler("You have already delivered this order", 400)
    );
  }

  // Update stock if status is Shipped
  if (req.body.status === "Shipped") {
    for (const o of order.orderItems) {
      await updateStock(o.product, o.quantity);
    }
  }

  // ✅ Update order status BEFORE saving
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
    
  });
});

// Update product stock
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}


//delete order - ADMIN
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order not found with this id', 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
    });
});