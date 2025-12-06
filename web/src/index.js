import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from "./store";
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={configureStore({})}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <GoogleOAuthProvider clientId="36719205814-a6n7v5gr3nao6dlrca415rtc6oaqd9bu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </Provider>
);

reportWebVitals();
