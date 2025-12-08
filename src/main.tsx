import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Entertainer from "./Entertainer.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Entertainer />
	</StrictMode>,
);
