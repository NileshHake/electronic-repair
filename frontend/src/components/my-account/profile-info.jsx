import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import * as Yup from "yup";
import Cookies from "js-cookie";

// internal
import ErrorMsg from "../common/error-msg";
import { EmailTwo, LocationTwo, PhoneThree, UserThree } from "@/svg";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { userLoggedIn } from "@/redux/features/auth/authSlice";

// ✅ Yup validation schema
const schema = Yup.object().shape({
  user_name: Yup.string().required("Name is required"),
  user_email: Yup.string().email("Invalid email").required("Email is required"),
  user_phone_number: Yup.string()
    .min(10, "Minimum 10 digits")
    .required("Phone number is required"),
  user_address_pincode: Yup.string().required("Pincode is required"),
  user_address_city: Yup.string().required("City is required"),
  user_address_district: Yup.string().required("District is required"),
});

const ProfileInfo = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, accessToken } = useSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();

  // ✅ react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      user_id: user?.user_id || "",
      user_name: user?.user_name || "",
      user_email: user?.user_email || "",
      user_phone_number: user?.user_phone_number || "",
      user_address_pincode: user?.user_address_pincode || "",
      user_address_city: user?.user_address_city || "",
      user_address_district: user?.user_address_district || "",
    },
  });

  // ✅ Submit handler
  const onSubmit = (data) => {
    updateProfile({
      user_id: user?.user_id,
      ...data,
    }).then((result) => {
      if (result?.error) {
        notifyError(result?.error?.data?.message || "Update failed");
      } else {
        const updatedUser =
          result?.data?.data || result?.data?.user || result?.data;

        notifySuccess(result?.data?.message || "Profile updated successfully");

        // ✅ Update cookie (token preserved)
        Cookies.set(
          "userInfo",
          JSON.stringify({
            accessToken,
            user: updatedUser,
          }),
          { expires: 0.5 }
        );

        // ✅ Update redux
        dispatch(
          userLoggedIn({
            accessToken,
            user: updatedUser,
          })
        );

        // ✅ Navigate to home
        router.push("/");
      }
    });
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">Personal Details</h3>

      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">

            {/* Name */}
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_name")}
                    type="text"
                    placeholder="Enter your name"
                  />
                  <span><UserThree /></span>
                  <ErrorMsg msg={errors.user_name?.message} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_email")}
                    type="email"
                    placeholder="Enter your email"
                  />
                  <span><EmailTwo /></span>
                  <ErrorMsg msg={errors.user_email?.message} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_phone_number")}
                    type="text"
                    placeholder="Enter your phone number"
                  />
                  <span><PhoneThree /></span>
                  <ErrorMsg msg={errors.user_phone_number?.message} />
                </div>
              </div>
            </div>

            {/* Pincode */}
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_address_pincode")}
                    type="text"
                    placeholder="Enter pincode"
                  />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_pincode?.message} />
                </div>
              </div>
            </div>

            {/* City */}
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_address_city")}
                    type="text"
                    placeholder="Enter city"
                  />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_city?.message} />
                </div>
              </div>
            </div>

            {/* District */}
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <textarea
                    {...register("user_address_district")}
                    placeholder="Enter district"
                  />
                  <ErrorMsg msg={errors.user_address_district?.message} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="col-xxl-12">
              <div className="profile__btn">
                <button type="submit" className="tp-btn">
                  Update Profile
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;
