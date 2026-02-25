"use client";

import { useEffect } from "react";
import InstallPWA from "./InstallPWA";
import OfflineDetector from "./OfflineDetector";
import PWAUpdater from "./PWAUpdater";

export default function PWAComponents() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return (
    <>
      <OfflineDetector />
      <InstallPWA />
      <PWAUpdater />
    </>
  );
}
