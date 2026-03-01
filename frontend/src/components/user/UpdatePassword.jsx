import React, { useEffect, useState } from "react";
import { useUpdatePasswordMutation } from "../../redux/api/userApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import UserLayout from "../layout/UserLayout";

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [updatePassword, { isLoading, error, isSuccess }] =
    useUpdatePasswordMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }

    if (isSuccess) {
      toast.success("Password Updated Successfully");
      navigate("/me/profile");
    }
  }, [error, isSuccess, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    updatePassword({
      oldPassword,
      password,
    });
  };

  return (
    <UserLayout>
      <div className="container d-flex justify-content-center align-items-center py-5">
        <div className="col-12 col-md-8 col-lg-6">
          <form
            className="bg-white shadow-lg rounded-4 p-5"
            onSubmit={submitHandler}
          >
            <h3 className="mb-4 text-center fw-bold">Update Password</h3>

            {/* Old Password */}
            <div className="mb-4">
              <label
                htmlFor="old_password_field"
                className="form-label fw-semibold"
              >
                Old Password
              </label>
              <input
                type="password"
                id="old_password_field"
                className="form-control form-control-lg"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label
                htmlFor="new_password_field"
                className="form-label fw-semibold"
              >
                New Password
              </label>
              <input
                type="password"
                id="new_password_field"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="btn btn-dark w-100 py-2 rounded-3"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default UpdatePassword;
