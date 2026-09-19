import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <main><h1>QuantGuard</h1><p>Don't just backtest. Stress-test.</p></main>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
