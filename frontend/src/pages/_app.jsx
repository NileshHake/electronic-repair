import store from "@/redux/store";
import { Provider } from "react-redux";
import ReactModal from "react-modal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import '../styles/index.scss';
import { GoogleOAuthProvider } from "@react-oauth/google";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

if (typeof window !== "undefined") {
  ReactModal.setAppElement("body");
}

// stripePromise
const NEXT_PUBLIC_STRIPE_KEY = 'pk_test_51M6BIWJiVHIFxYwiOXHKzmHAXm3QBTPca0ewQcX55zju2j0RNqj1wvQUI0GVE2B3Yvx94h7lvKFqC5dS8HhMoatY00ox5oPPtM';
const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_KEY);
const NEXT_PUBLIC_GOOGLE_CLIENT_ID = '872872451077-h90g0g0762aoi4vfk0iv6oug1pg4h2u0.apps.googleusercontent.com'
export default function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Elements stripe={stripePromise}>
          <div id="root">
            <Component {...pageProps} />
          </div>
        </Elements>
      </Provider>
    </GoogleOAuthProvider>
  )
}
