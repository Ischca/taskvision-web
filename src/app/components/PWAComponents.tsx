"use client";

import InstallPWA from "./InstallPWA";
import OfflineDetector from "./OfflineDetector";
import PWAUpdater from "./PWAUpdater";

export default function PWAComponents() {
    return (
        <>
            <OfflineDetector />
            <InstallPWA />
            <PWAUpdater />
        </>
    );
} 