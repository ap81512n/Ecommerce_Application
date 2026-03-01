import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./components/Home";
import { Toaster } from "react-hot-toast";
import ProductDetails from "./components/product/ProductDetails";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Profile from "./components/user/Profile.jsx";
import UpdateProfile from "./components/user/UpdateProfile";
import UploadAvatar from "./components/user/UploadAvatar";
import UpdatePassword from "./components/user/UpdatePassword";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Toaster position="top-centre"/>
      <Header />
      <div className="container container-fluid">
        <Routes>
          {/* Define your routes here */}
          <Route path="/" element={<Home />} />
          <Route path="/Product/:id" element={<ProductDetails />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/me/profile" element={<Profile />} />
          <Route path="/me/update_profile" element={<UpdateProfile />} />
          <Route path="/me/upload_avatar" element={<UploadAvatar />} />
          <Route path="/me/update_password" element={<UpdatePassword />} />
          {/* Example: add more pages */}
          {/* <Route path="/about" element={<About />} /> */}
            <Route
              path="/me/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

             <Route
              path="/me/update_profile"
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/me/upload_avatar"
              element={
                <ProtectedRoute>
                  <UploadAvatar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/me/update_password"
              element={
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              }
            />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
