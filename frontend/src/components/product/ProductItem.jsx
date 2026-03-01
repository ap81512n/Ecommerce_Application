import React from "react";
import { Link } from "react-router-dom";

const ProductItem = ({ product }) => {
  const totalStars = 5;
  const rating = product?.ratings || 0;

  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded h-100 d-flex flex-column">
        {/* Product Image */}
        <img
          className="card-img-top mx-auto"
          src={product?.images?.[0]?.url || "/images/default_product.png"}
          alt={product?.name}
          style={{ height: "200px", objectFit: "cover" }}
        />

        <div className="card-body ps-3 d-flex flex-column">
          {/* Product Name */}
          <h5 className="card-title text-truncate">
            <Link to={`/product/${product?._id}`}>{product?.name}</Link>
          </h5>

          {/* ⭐ Star Ratings */}
          <div className="ratings mt-auto d-flex align-items-center">
            <div className="d-flex">
            {[...Array(totalStars)].map((_, index) => {
            const starValue = index + 1;
            if (rating >= starValue) {
            return <i key={index} className="fas fa-star"></i>; // full star
            } else if (rating >= starValue - 0.5) {
            return <i key={index} className="fas fa-star-half-alt"></i>; // half star
            }else {
            return <i key={index} className="far fa-star"></i>; // empty star
        }
        })}

            </div>

            <span id="no_of_reviews" className="ms-2 small text-muted">
              {product?.numOfReviews || 0} Reviews
            </span>
          </div>

          {/* Price */}
          <p className="card-text mt-2 fw-bold">$ {product?.price}</p>

          {/* View Details Button */}
          <Link
            to={`/product/${product?._id}`}
            id="view_btn"
            className="btn btn-block btn-primary mt-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
