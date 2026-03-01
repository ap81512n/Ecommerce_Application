import React, {dispatch} from "react";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setIsAuthenticated,setUser,logout } from "../../redux/features/userSlice";   // adjust path

const Header = () => {
  const navigate = useNavigate();
  console.log("DEBUG");
  const { isLoading } = useGetMeQuery();
  const [logoutApi] = useLazyLogoutQuery();

  const { user } = useSelector((state) => state.auth || {});

  const logouthandler = async () => {
    try {
      await logoutApi(); // wait for logout API
      //dispatch(logout());
      navigate(0);      // redirect after logout
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <nav
      className="navbar row px-4 py-3 shadow-sm"
      style={{ background: "linear-gradient(90deg, #000000 0%, #1c1c1c 100%)" }}
    >
      {/* Logo */}
      <div className="col-12 col-md-3 d-flex align-items-center">
        <Link to="/" className="navbar-brand">
          <img
            src="/images/ShopAll_Logo.jpg"
            alt="ShopAll Logo"
            height="45"
            className="d-inline-block align-text-top rounded"
          />
        </Link>
      </div>

      {/* Search */}
      <div className="col-12 col-md-6 my-2 my-md-0">
        <Search />
      </div>

      {/* User + Cart */}
      <div className="col-12 col-md-3 mt-3 mt-md-0 d-flex justify-content-center justify-content-md-end align-items-center">

        {/* Cart */}
        <Link to="/cart" className="position-relative me-4 text-white fw-bold">
          <i className="fa fa-shopping-cart fa-lg"></i>
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            id="cart_count"
          >
            0
          </span>
        </Link>

        {/* If logged in → user dropdown */}
        {user ? (
          <div className="dropdown d-inline-block">
            <button
              className="btn text-white dropdown-toggle d-flex align-items-center"
              type="button"
              id="dropDownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={user.avatar?.url || "/images/avatar-default-icon.png"}
                alt="User Avatar"
                className="rounded-circle me-2"
                width="35"
                height="35"
              />
              <span className="fw-semibold">{user.name}</span>
            </button>

            {/* Dropdown menu */}
            <ul className="dropdown-menu shadow border-0 rounded-3 mt-2">
              <li>
                <Link className="dropdown-item" to="/me/profile">
                  Profile
                </Link>
              </li>

              <li>
                <Link className="dropdown-item" to="/me/orders">
                  Orders
                </Link>
              </li>

              {user.role === "admin" && (
                <li>
                  <Link className="dropdown-item" to="/admin/dashboard">
                    Dashboard
                  </Link>
                </li>
              )}

              <li>
                <button className="dropdown-item text-danger"  onClick={logouthandler}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          // If logged out → show login button
          <Link
            to="/login"
            className="btn btn-outline-light fw-semibold px-4 rounded-pill shadow-sm"
            id="login_btn"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;
