import React, { useEffect, useMemo } from "react";
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

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

// ✅ Yup validation schema (email disabled so no need required validation)
const schema = Yup.object().shape({
  user_name: Yup.string().required("Name is required"),
  user_phone_number: Yup.string().min(10, "Minimum 10 digits").required("Phone number is required"),

  // address
  user_address_pincode: Yup.string().required("Pincode is required"),
  user_address_city: Yup.string().required("City is required"),
  user_address_district: Yup.string().required("District is required"),
  user_address_state: Yup.string().required("State is required"),

  // bank (important)
  user_upi_id: Yup.string().nullable(),
  user_bank_name: Yup.string().nullable(),
  user_ifsc_code: Yup.string().nullable(),
  user_branch_name: Yup.string().nullable(),
  user_bank_account_number: Yup.string().nullable(),
});

const ProfileInfo = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, accessToken, singleUser } = useSelector((state) => state.auth);
  const currentUser = singleUser || user;

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // ✅ if your backend returns gst data joined, it will be available as:
  // gst_* columns directly (flat response). We'll read using fallback keys.
  const gst = useMemo(() => {
    if (!currentUser) return null;

    return {
      gst_id: currentUser?.gst_id ?? currentUser?.user_gst_id ?? null,
      gstin: currentUser?.gst_gstin ?? null,
      legalName: currentUser?.gst_legal_name ?? null,
      tradeName: currentUser?.gst_trade_name ?? null,
      status: currentUser?.gst_status ?? currentUser?.gst_current_status ?? null,
      regDate: currentUser?.gst_registration_date ?? null,
      constitution: currentUser?.gst_constitution ?? null,
      type: currentUser?.gst_type ?? null,
      address: currentUser?.gst_principal_address ?? null,
    };
  }, [currentUser]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      user_id: currentUser?.user_id || "",

      user_name: currentUser?.user_name || "",
      user_email: currentUser?.user_email || "", // disabled
      user_phone_number: currentUser?.user_phone_number || "",

      // bank
      user_upi_id: currentUser?.user_upi_id || "",
      user_bank_name: currentUser?.user_bank_name || "",
      user_ifsc_code: currentUser?.user_ifsc_code || "",
      user_branch_name: currentUser?.user_branch_name || "",
      user_bank_account_number: currentUser?.user_bank_account_number || "",

      // address
      user_address_pincode: currentUser?.user_address_pincode || "",
      user_address_state: currentUser?.user_address_state || "",
      user_address_district: currentUser?.user_address_district || "",
      user_address_city: currentUser?.user_address_city || "",
      user_address_block: currentUser?.user_address_block || "",
      user_address_description: currentUser?.user_address_description || "",
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    reset({
      user_id: currentUser?.user_id || "",

      user_name: currentUser?.user_name || "",
      user_email: currentUser?.user_email || "",
      user_phone_number: currentUser?.user_phone_number || "",

      // bank
      user_upi_id: currentUser?.user_upi_id || "",
      user_bank_name: currentUser?.user_bank_name || "",
      user_ifsc_code: currentUser?.user_ifsc_code || "",
      user_branch_name: currentUser?.user_branch_name || "",
      user_bank_account_number: currentUser?.user_bank_account_number || "",

      // address
      user_address_pincode: currentUser?.user_address_pincode || "",
      user_address_state: currentUser?.user_address_state || "",
      user_address_district: currentUser?.user_address_district || "",
      user_address_city: currentUser?.user_address_city || "",
      user_address_block: currentUser?.user_address_block || "",
      user_address_description: currentUser?.user_address_description || "",
    });
  }, [currentUser, reset]);

  const getTokenSafe = () => {
    const cookie = Cookies.get("userInfo");
    try {
      const parsed = cookie ? JSON.parse(cookie) : null;
      return parsed?.accessToken || accessToken || "";
    } catch {
      return accessToken || "";
    }
  };

  const onSubmit = (formData) => {
    updateProfile({
      user_id: currentUser?.user_id,
      ...formData,
    }).then((result) => {
      if (result?.error) {
        notifyError(result?.error?.data?.message || "Update failed");
        return;
      }

      const updatedUser = result?.data?.data || result?.data?.user || result?.data;
      notifySuccess(result?.data?.message || "Profile updated successfully");

      const token = getTokenSafe();

      Cookies.set(
        "userInfo",
        JSON.stringify({
          accessToken: token,
          user: updatedUser,
        }),
        { expires: 0.5 }
      );

      dispatch(
        userLoggedIn({
          accessToken: token,
          user: updatedUser,
        })
      );

      router.push("/");
    });
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">Personal Details</h3>

      {/* ✅ TOP: User Summary */}
      <div className="mb-3 p-3 border rounded bg-light">
        <div>
          <strong>User:</strong> {toText(currentUser?.user_name)}
        </div>
        <div>
          <strong>Email:</strong> {toText(currentUser?.user_email)}
        </div>
        <div>
          <strong>Phone:</strong> {toText(currentUser?.user_phone_number)}
        </div>
      </div>

      {/* ✅ GST Details (Read only) */}
      <div className="mb-3 p-3 border rounded">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0">GST Details</h5>
          {gst?.status ? (
            <span className={`badge ${gst.status === "Active" ? "bg-success" : "bg-secondary"}`}>
              {toText(gst.status)}
            </span>
          ) : (
            <span className="badge bg-light text-dark">Not Added</span>
          )}
        </div>

        <div className="row g-2">
          <div className="col-md-6">
            <div><strong>GSTIN:</strong> {toText(gst?.gstin)}</div>
          </div>
          <div className="col-md-6">
            <div><strong>Trade Name:</strong> {toText(gst?.tradeName)}</div>
          </div>
          <div className="col-md-6">
            <div><strong>Legal Name:</strong> {toText(gst?.legalName)}</div>
          </div>
          <div className="col-md-6">
            <div><strong>Reg Date:</strong> {toText(gst?.regDate)}</div>
          </div>
          <div className="col-md-6">
            <div><strong>Constitution:</strong> {toText(gst?.constitution)}</div>
          </div>
          <div className="col-md-6">
            <div><strong>Type:</strong> {toText(gst?.type)}</div>
          </div>
          <div className="col-12">
            <div><strong>Address:</strong> {toText(gst?.address)}</div>
          </div>
        </div>
      </div>

      {/* ✅ Profile Form */}
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* Name */}
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_name")} type="text" placeholder="Enter your name" />
                  <span><UserThree /></span>
                  <ErrorMsg msg={errors.user_name?.message} />
                </div>
              </div>
            </div>

            {/* Email (DISABLED) */}
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("user_email")}
                    type="email"
                    placeholder="Enter your email"
                    disabled
                    style={{ background: "#f2f2f2", cursor: "not-allowed" }}
                  />
                  <span><EmailTwo /></span>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_phone_number")} type="text" placeholder="Enter your phone number" />
                  <span><PhoneThree /></span>
                  <ErrorMsg msg={errors.user_phone_number?.message} />
                </div>
              </div>
            </div>

            {/* ✅ Bank Details (Important) */}
            <div className="col-12 mt-2">
              <h5 className="mb-2">Bank Details</h5>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_upi_id")} type="text" placeholder="UPI ID (optional)" />
                  <ErrorMsg msg={errors.user_upi_id?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_bank_name")} type="text" placeholder="Bank Name" />
                  <ErrorMsg msg={errors.user_bank_name?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_ifsc_code")} type="text" placeholder="IFSC Code" />
                  <ErrorMsg msg={errors.user_ifsc_code?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_branch_name")} type="text" placeholder="Branch Name" />
                  <ErrorMsg msg={errors.user_branch_name?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_bank_account_number")} type="text" placeholder="Account Number" />
                  <ErrorMsg msg={errors.user_bank_account_number?.message} />
                </div>
              </div>
            </div>

            {/* ✅ Address */}
            <div className="col-12 mt-2">
              <h5 className="mb-2">Address</h5>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_address_pincode")} type="text" placeholder="Enter pincode" />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_pincode?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_address_state")} type="text" placeholder="Enter state" />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_state?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_address_city")} type="text" placeholder="Enter city" />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_city?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_address_district")} type="text" placeholder="Enter district" />
                  <span><LocationTwo /></span>
                  <ErrorMsg msg={errors.user_address_district?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input {...register("user_address_block")} type="text" placeholder="Enter block (optional)" />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <textarea {...register("user_address_description")} placeholder="Full address (optional)" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="col-xxl-12">
              <div className="profile__btn">
                <button type="submit" className="tp-btn" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
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