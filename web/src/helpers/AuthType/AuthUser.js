import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedPermissions } from "../../store/Role";
import { getSingleUser } from "../../store/User";
import { useNavigate, useLocation } from "react-router-dom";

const AuthUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const checkedOnce = useRef(false); // 🔒 prevent multiple redirects

  // ---------- REDUX ----------
  const { singleUser, loading } = useSelector(
    (state) => state.UserReducer
  );

  const { assignedPermissions = [] } = useSelector(
    (state) => state.roleReducer
  );

  // ---------- SESSION ----------
  const authUser = sessionStorage.getItem("authUser");
  const parsed = authUser ? JSON.parse(authUser) : null;

  const sessionUser = parsed?.user || null;
  const BusinessData = parsed?.BusinessData || null;

  // ---------- FETCH USER & PERMISSIONS ----------
  useEffect(() => {
    if (!sessionUser?.user_id || !sessionUser?.user_role_id) return;

    dispatch(getSingleUser(sessionUser.user_id));
    dispatch(getAssignedPermissions(sessionUser.user_role_id));
  }, [dispatch, sessionUser?.user_id, sessionUser?.user_role_id]);

  // ---------- PROFILE VALIDATION ----------
  useEffect(() => {
    // ⛔ run once
    if (checkedOnce.current) return;

    // ⛔ wait until API finishes
    if (loading || !singleUser?.user_id) return;

    // ⛔ skip if already on profile page
    if (location.pathname === "/pages-profile-settings") {
      checkedOnce.current = true;
      return;
    }

    const isEmpty = (v) => {
      if (v === null || v === undefined) return true;
      if (typeof v === "string" && v.trim() === "") return true;
      return false;
    };

    const {
      user_phone_number,
      user_address_pincode,
      user_address_state,
      user_address_district,
      user_address_block,
      user_address_city,
      user_address_description,
      user_type,
    } = singleUser;

    // ✅ ONLY REQUIRED FIELDS
    const requiredFields =
      user_type === 6
        ? [
            user_phone_number,
            user_address_pincode,
            user_address_state,
            user_address_district,
            user_address_block,
            user_address_city,
            user_address_description,
          ]
        : [
            user_phone_number,
            user_address_pincode,
            user_address_state,
            user_address_district,
            user_address_block,
            user_address_city,
            user_address_description,
          ];

    const isIncomplete = requiredFields.some(isEmpty);

    checkedOnce.current = true;

    if (isIncomplete) {
      // navigate("/pages-profile-settings", { replace: true });
    }
  }, [singleUser, loading, navigate, location.pathname]);

  // ---------- RETURN AUTH DATA ----------
  return useMemo(
    () => ({
      user: singleUser || sessionUser,
      BusinessData,
      permissions: assignedPermissions,
     
    }),
    [singleUser, sessionUser, BusinessData, assignedPermissions]
  );
};

export default AuthUser;
