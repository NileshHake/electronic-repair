import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

// schema
const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Password"),
  newPassword: Yup.string().required().min(6).label("New Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match"
  ),
});
// schemaTwo
const schemaTwo = Yup.object().shape({
  newPassword: Yup.string().required().min(6).label("New Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match"
  ),
});

const ChangePassword = () => {
 
  return (
    <div className="profile__password">
     
    </div>
  );
};

export default ChangePassword;
