import React, { useEffect, useState } from "react";
import { useLoginMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();

  // safer selector in case state.auth is undefined
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    if (error) {
      toast.error(error?.data?.message || "Login failed");
    }
  }, [error, isAuthenticated, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    login(loginData);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          {/* center the card on all screen sizes */}
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="mb-4 text-center">Login</h2>

                <form onSubmit={submitHandler} noValidate>
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password_field" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password_field"
                      className="form-control"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small>
                      <Link to="/password/forgot">Forgot Password?</Link>
                    </small>
                  </div>

                  <button
                    id="login_button"
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Authenticating..." : "LOGIN"}
                  </button>

                  <div className="mt-3 text-center">
                    <small>
                      New user?{" "}
                      <Link to="/register" className="fw-semibold">
                        Create an account
                      </Link>
                    </small>
                  </div>
                </form>
              </div>
            </div>

            {/* optional: place global form-level error / helper text */}
            <div className="text-center mt-3 text-muted small">
              {/* helpful tip or branding */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
