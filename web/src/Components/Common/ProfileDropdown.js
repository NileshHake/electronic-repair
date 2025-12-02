import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { logoutUser } from "../../store/actions";
import { getSingleUser, resetUpdateUserResponse } from "../../store/User";
import AuthUser from "../../helpers/AuthType/AuthUser";
import { api } from "../../config";

const ProfileDropdown = () => {
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = AuthUser();

  const { singleUser, updateUserResponse } = useSelector(
    (state) => state.UserReducer
  );

  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  useEffect(() => {
    if (user?.user_id) {
      dispatch(getSingleUser(user.user_id));
    }
  }, [user?.user_id, dispatch]);

  useEffect(() => {
    if (updateUserResponse) {
      dispatch(getSingleUser(user.user_id));
      dispatch(resetUpdateUserResponse());
    }
  }, [updateUserResponse, user?.user_id, dispatch]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser(navigate));
  };

  return (
    <Dropdown
      isOpen={isProfileDropdown}
      toggle={toggleProfileDropdown}
      className="ms-sm-3 header-item topbar-user"
    >
      <DropdownToggle tag="button" type="button" className="btn shadow-none">
        <span className="d-flex align-items-center">
          <img
            className="rounded-circle header-profile-user"
            src={
              singleUser?.user_profile
                ? `${api.IMG_URL}user_profile/${singleUser.user_profile}`
                : avatar1
            }
            alt="Header Avatar"
          />
          <span className="text-start ms-xl-2">
            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
              {singleUser?.user_name || "N/A"}
            </span>
            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
              {user?.user_type ===  1
                ? "Super Admin"
                : user?.user_type ===   2
                ? "Admin"
                : user?.user_type ===   3
                ? "User"
                : user?.user_type ===   4
                ? "Technician"
                : user?.user_type ===   5
                ? "Delivery Boy"
                : user?.user_type ===   6
                ? "Customer"
                : ""}
            </span>
          </span> 
        </span>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end">
        <h6 className="dropdown-header">
          Welcome {singleUser?.user_name || "N/A"}!
        </h6>

        <DropdownItem tag={Link} to="/pages-profile-settings">
          <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Profile</span>
        </DropdownItem>

        <div className="dropdown-divider"></div>

        <DropdownItem onClick={handleLogout} style={{ cursor: "pointer" }}>
          <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle" data-key="t-logout">
            Logout
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
