import React, { useEffect, useState } from "react";
import { useRegisterMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = user;
  const navigate = useNavigate();

  const [register, { isLoading, error }] = useRegisterMutation();

  // safer selector to avoid crashes if state.auth is undefined
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    if (error) {
      toast.error(error?.data?.message || "Registration failed");
    }
  }, [error, isAuthenticated, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    const signUpData = {
      name,
      email,
      password,
    };

    register(signUpData);
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          {/* Center the card on all screen sizes */}
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="mb-4 text-center">Create Account</h2>

                <form onSubmit={submitHandler} noValidate>
                  <div className="mb-3">
                    <label htmlFor="name_field" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name_field"
                      className="form-control"
                      name="name"
                      value={name}
                      onChange={onChange}
                      required
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email_field" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email_field"
                      className="form-control"
                      name="email"
                      value={email}
                      onChange={onChange}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password_field" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password_field"
                      className="form-control"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    id="register_button"
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "REGISTER"}
                  </button>

                  <div className="mt-3 text-center">
                    <small>
                      Already have an account?{" "}
                      <Link to="/login" className="fw-semibold">
                        Sign in
                      </Link>
                    </small>
                  </div>
                </form>
              </div>
            </div>

            {/* optional helper text */}
            <div className="text-center mt-3 text-muted small">
              By creating an account you agree to our Terms of Service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
