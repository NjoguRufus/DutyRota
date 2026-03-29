import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initThemeFromStorage } from "@/lib/userPreferences";

initThemeFromStorage();

createRoot(document.getElementById("root")!).render(<App />);
