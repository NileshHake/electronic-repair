import React from "react";
import ReactDOM from "react-dom/client";
import { configureStore } from "./store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

// ✅ Import GoogleOAuthProvider
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

// ✅ Use your client ID (you can also use import.meta.env.VITE_GOOGLE_CLIENT_ID if on Vite)
const GOOGLE_CLIENT_ID =
  "36719205814-a6n7v5gr3nao6dlrca415rtc6oaqd9bu.apps.googleusercontent.com";

root.render(
  <Provider store={configureStore({})}>
    <React.Fragment>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        {/* ✅ Wrap the whole app with GoogleOAuthProvider */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.Fragment>
  </Provider>
);

reportWebVitals();
