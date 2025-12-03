import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedPermissions, getOldRolePermissions } from "../../store/Role";
import { getSingleUser } from "../../store/User";

const AuthUser = () => {
  const dispatch = useDispatch();

  const {
    rolePermissions = [],
    assignedPermissions = [],
    updateRoleResponse,
  } = useSelector((state) => state.roleReducer);

  const authUser = sessionStorage.getItem("authUser");
  const parsed = authUser ? JSON.parse(authUser) : null;

  const user = parsed.user || null;
  const BusinessData = parsed.BusinessData || null;

  useEffect(() => {
    if (user && user.user_role_id) {
      dispatch(getAssignedPermissions(user.user_role_id));
      dispatch(getSingleUser(user.user_id));
    }
  }, [dispatch, user?.user_role_id]);


  useEffect(() => {
    if (!assignedPermissions.length && user?.user_role_id) {
      dispatch(getAssignedPermissions(user.user_role_id));
    }
  }, []);

  return {
    user,
    BusinessData,
    permissions: assignedPermissions,
  };
};

export default AuthUser;
