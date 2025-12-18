const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// 🔥 ADMIN STATIC FILES (CRITICAL)
app.use(
  ["/admin", "/static", "/manifest.json", "/favicon.ico"],
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/admin": ""
    }
  })
);

// 🔥 NEXT.JS (LAST)
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    ws: true
  })
);

app.listen(4000, () => {
  console.log("🚀 Proxy running at http://localhost:4000");
});
