import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateProfileMutation } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import UserLayout from "../layout/UserLayout";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const [updateProfile, { isLoading, error, isSuccess }] =
    useUpdateProfileMutation();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setName(user?.name || "");
      setEmail(user?.email || "");
    }

    if (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }

    if (isSuccess) {
      toast.success("Profile Updated Successfully");
      navigate("/me/profile");
    }
  }, [user, error, isSuccess, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    updateProfile({
      name,
      email,
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
            <h3 className="mb-4 text-center fw-bold">Update Profile</h3>

            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name_field" className="form-label fw-semibold">
                Name
              </label>
              <input
                type="text"
                id="name_field"
                className="form-control form-control-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email_field" className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                id="email_field"
                className="form-control form-control-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2 rounded-3"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default UpdateProfile;
