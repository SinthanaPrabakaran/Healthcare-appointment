import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { Route } from "./routes/index";
import "./styles.css";

const App = Route.options.component!;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster position="top-right" richColors />
    <App />
  </React.StrictMode>
);
