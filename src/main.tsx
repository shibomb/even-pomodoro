import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initPersistence } from "./data/pomodoroPersistence";
import "./styles/app.css";

// Initialize bridge storage (preload cache) before first render
initPersistence().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
