import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from "./store";
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

// ✅ Import GoogleOAuthProvider
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={configureStore({})}>
    <React.Fragment>
      {/* ✅ Wrap whole app with GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId="36719205814-a6n7v5gr3nao6dlrca415rtc6oaqd9bu.apps.googleusercontent.com">
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </React.Fragment>
  </Provider>
);

reportWebVitals();
