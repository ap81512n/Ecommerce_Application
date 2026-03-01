import React, { useEffect, useState } from "react";
import UserLayout from "../layout/UserLayout";
import { useNavigate } from "react-router-dom";
import { useUploadAvatarMutation } from "../../redux/api/userApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const UploadAvatar = () => {
  const { user } = useSelector((state) => state.auth);

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar?.url || "../images/default_avatar.png"
  );

  const navigate = useNavigate();

  const [uploadAvatar, { isLoading, error, isSuccess }] =
    useUploadAvatarMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Upload failed");
    }

    if (isSuccess) {
      toast.success("Avatar Uploaded Successfully");
      navigate("/me/profile");
    }
  }, [error, isSuccess, navigate]);

const submitHandler = (e) => {
  e.preventDefault();
  if (!avatar) {
    toast.error("Please select an image.");
    return;
  }
  uploadAvatar({ avatar }); // avatar is a base64 string
};

  const onChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <UserLayout>
      <div className="container d-flex justify-content-center align-items-center py-5">
        <div className="col-12 col-md-8 col-lg-6">
          <form
            className="bg-white shadow-lg rounded-4 p-5 text-center"
            onSubmit={submitHandler}
          >
            <h3 className="mb-4 fw-bold">Upload Avatar</h3>

            {/* Avatar Preview */}
            <div className="mb-4">
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="rounded-circle shadow"
                width="140"
                height="140"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* File Input */}
            <div className="mb-4 text-start">
              <label className="form-label fw-semibold" htmlFor="customFile">
                Choose New Avatar
              </label>
              <input
                type="file"
                name="avatar"
                className="form-control form-control-lg"
                id="customFile"
                accept="image/*"
                onChange={onChange}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="btn btn-dark w-100 py-2 rounded-3"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Avatar"}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default UploadAvatar;
