import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPriceQueryParams } from "../../helpers/helpers";
import { PRODUCT_CATEGORIES } from "../constants/constants";
import { FaStar } from "react-icons/fa"; // modern star icon

const Filters = () => {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("min")) setMin(searchParams.get("min"));
    if (searchParams.has("max")) setMax(searchParams.get("max"));
  }, []);

  // Handle Category & Ratings filter
   const handleClick = (checkbox) => {
    const checkboxes = document.getElementsByName(checkbox.name);

    checkboxes.forEach((item) => {
      if (item !== checkbox) item.checked = false;
    });

    if (checkbox.checked === false) {
      // Delete filter from query
      if (searchParams.has(checkbox.name)) {
        searchParams.delete(checkbox.name);
        const path = window.location.pathname + "?" + searchParams.toString();
        navigate(path);
      }
    } else {
      // Set new filter value if already there
      if (searchParams.has(checkbox.name)) {
        searchParams.set(checkbox.name, checkbox.value);
      } else {
        // Append new filter
        searchParams.append(checkbox.name, checkbox.value);
      }

      const path = window.location.pathname + "?" + searchParams.toString();
      navigate(path);
    }
  };

  // Handle price filter
  const handleButtonClick = (e) => {
    e.preventDefault();

    searchParams = getPriceQueryParams(searchParams, "min", min);
    searchParams = getPriceQueryParams(searchParams, "max", max);

    navigate(`${window.location.pathname}?${searchParams.toString()}`);
  };

  const defaultCheckHandler = (checkboxType, checkboxValue) =>
    searchParams.get(checkboxType) === checkboxValue;

  // ⭐ Custom Star Rating Component
  const StarRating = ({ rating }) => (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          size={20}
          color={i <= rating ? "#ffb829" : "#e4e5e9"}
        />
      ))}
    </div>
  );

  return (
    <div className="border p-3 filter">
      <h3>Filters</h3>
      <hr />
      <h5 className="filter-heading mb-3">Price</h5>
<form id="filter_form" className="px-2" onSubmit={handleButtonClick}>
  <div className="row g-2">
    {/* Min Price */}
    <div className="col">
      <label htmlFor="min" className="form-label mb-1 fw-semibold">
        Min Price
      </label>
      <input
        type="number"
        className="form-control"
        id="min"
        placeholder="min"
        name="min"
        value={min}
        onChange={(e) => setMin(e.target.value)}
      />
    </div>

    {/* Max Price */}
    <div className="col">
      <label htmlFor="max" className="form-label mb-1 fw-semibold">
        Max Price
      </label>
      <input
        type="number"
        className="form-control"
        id="max"
        placeholder="max"
        name="max"
        value={max}
        onChange={(e) => setMax(e.target.value)}
      />
    </div>

    {/* Submit Button */}
    <div className="col-auto d-flex align-items-end">
      <button type="submit" className="btn btn-primary w-100">
        GO
      </button>
    </div>
  </div>
</form>

      <hr />

      <h5 className="mb-3">Category</h5>
      {PRODUCT_CATEGORIES?.map((category, idx) => (
        <div className="form-check" key={idx}>
          <input
            className="form-check-input"
            type="checkbox"
            name="category"
            id={`category-${idx}`}
            value={category}
            defaultChecked={defaultCheckHandler("category", category)}
            onClick={(e) => handleClick(e.target)}
          />
          <label className="form-check-label" htmlFor={`category-${idx}`}>
            {category}
          </label>
        </div>
      ))}

      <hr />
      <h5 className="mb-3">Ratings</h5>
      {[5, 4, 3, 2, 1].map((rating, idx) => (
        <div className="form-check d-flex align-items-center" key={idx}>
          <input
            className="form-check-input me-2"
            type="checkbox"
            name="ratings"
            id={`rating-${rating}`}
            value={rating}
            defaultChecked={defaultCheckHandler("ratings", rating.toString())}
            onClick={(e) => handleClick(e.target)}
          />
          <label
            className="form-check-label"
            htmlFor={`rating-${rating}`}
            style={{ cursor: "pointer" }}
          >
            <StarRating rating={rating} />
          </label>
        </div>
      ))}
    </div>
  );
};

export default Filters;
