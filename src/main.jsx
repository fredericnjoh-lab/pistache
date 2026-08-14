import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Pistache from "./Pistache.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Pistache />
  </StrictMode>
);
