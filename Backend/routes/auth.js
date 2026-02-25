
import express from 'express';
import { isAuthenticatedUser, authorizeRoles  } from '../middleware/auth.js';

import { forgotPassword,changePassword,deleteUserByAdmin,getAdminUserById,updateUserProfileByAdmin, getAllAdminUsers,updateUserProfile, getCurrentUserDetails, loginUser, logoutUser, registerUser, resetPassword, uploadAvatar } from '../controllers/authControllers.js';

const router = express.Router();


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticatedUser, getCurrentUserDetails);
router.route('/me/updatepassword').put(isAuthenticatedUser, changePassword);
router.route('/me/updateprofile').put(isAuthenticatedUser, updateUserProfile);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles("admin"), getAllAdminUsers);
router.route('/admin/userid/:id').get(isAuthenticatedUser, authorizeRoles("admin"), getAdminUserById);
router.route('/admin/user/update/:id').put(isAuthenticatedUser, authorizeRoles("admin"), updateUserProfileByAdmin);
router.route('/admin/user/delete/:id').delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUserByAdmin);




export default router;
// This code sets up an Express router for handling user authentication routes.
// It imports the `registerUser` function from the `authControllers` module and defines a route for user registration.
