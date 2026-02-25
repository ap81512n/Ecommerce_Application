// Create a function to create product review
import catchAsyncErrors from "../middleware/catchasyncError.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";

export const createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Review added/updated successfully',
    });
});


//write a function to Get all reviews of a product
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

//Write a function to delete a review which accepts params in the url
// controllers/reviewController.js

// DELETE Review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const { productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (!product.reviews || product.reviews.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No reviews yet for this product",
      reviews: [],
    });
  }

  // Filter out the review being deleted
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );

  // Recalculate ratings
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = reviews.length === 0 ? 0 : avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});






