import React from "react";
import LoginForm from "../forms/login-form";
import LoginShapes from "./login-shapes";
import GoogleSignUp from "./google-sign-up";

const LoginArea = () => {
  return (
    <section className="tp-login-area pb-140 p-relative z-index-1 fix">
      <LoginShapes />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-login-wrapper">

              {/* TOP TEXT */}
              <div className="tp-login-top text-center mb-30">
                <h3 className="tp-login-title">Welcome to Shofy</h3>
                <p className="text-muted">
                  Sign in with Google.  
                  <br />
                  <small>
                    New user? We’ll automatically create your account.
                  </small>
                </p>
              </div>

              {/* GOOGLE LOGIN */}
              <div className="tp-login-option">
                <div className="tp-login-social mb-20 d-flex justify-content-center">
                  <div className="tp-login-option-item has-google">
                    <GoogleSignUp />
                  </div>
                </div>

               
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
