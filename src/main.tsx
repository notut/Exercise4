import React from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./modules/app/Application"; // Sjekk om dette er riktig sti

const rootElement = document.getElementById("root");

//Hvis root elementet ikke finnes, kommer det en feilmelding
if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure index.html has <div id='root'></div>",
  );
}

//Oppretter en react root
createRoot(rootElement).render(<Application />);
