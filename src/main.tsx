import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import App from "./app/App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Analytics />
  </BrowserRouter>,
);
