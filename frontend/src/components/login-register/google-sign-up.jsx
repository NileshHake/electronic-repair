import React from "react";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
// internal
import google_icon from "@assets/img/icon/login/google.svg";
import { useSignUpProviderMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { jwtDecode } from "jwt-decode";

const GoogleSignUp = () => {
  const [signUpProvider, { }] = useSignUpProviderMutation();
  const router = useRouter();
  const { redirect } = router.query;
  // handleGoogleSignIn
  const handleGoogleSignIn = (user) => {
    if (user) {
      const decoded = jwtDecode(user.credential);
      signUpProvider(decoded).then((res) => {
        if (res?.data) {
          router.push(redirect || "/");
          notifySuccess("Login success!");
        } else {

          notifyError(res.error?.message);
        }
      });
    }
  };
  return (
    <GoogleLogin
      render={(renderProps) => (
        <a
          className="cursor-pointer"
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          <Image src={google_icon} alt="google_icon" />
          Sign in with google
        </a>
      )}
      onSuccess={handleGoogleSignIn}
      onFailure={(err) =>
        notifyError(err?.message || "Something wrong on your auth setup!")
      }
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default GoogleSignUp;
