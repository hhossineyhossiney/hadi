"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallOutcome = "accepted" | "dismissed" | "installed" | "unavailable";

declare global {
  interface Window {
    __fanixoDeferredInstallPrompt?: InstallPromptEvent;
  }
}

type PWAInstallContextValue = {
  canInstall: boolean;
  isStandalone: boolean;
  install: () => Promise<InstallOutcome>;
};

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsStandalone(isStandaloneDisplayMode());
      if (window.__fanixoDeferredInstallPrompt) setInstallEvent(window.__fanixoDeferredInstallPrompt);
    });

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((registration) => {
        registration.update().catch(() => {});
      }).catch(() => {});
    }

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as InstallPromptEvent;
      window.__fanixoDeferredInstallPrompt = promptEvent;
      setInstallEvent(promptEvent);
    };
    const handleInstalled = () => {
      delete window.__fanixoDeferredInstallPrompt;
      setInstallEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<InstallOutcome> => {
    if (isStandaloneDisplayMode() || isStandalone) return "installed";
    if (!installEvent) return "unavailable";

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    delete window.__fanixoDeferredInstallPrompt;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setIsStandalone(true);
    return choice.outcome;
  }, [installEvent, isStandalone]);

  const value = useMemo<PWAInstallContextValue>(() => ({
    canInstall: Boolean(installEvent) && !isStandalone,
    isStandalone,
    install,
  }), [installEvent, install, isStandalone]);

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) throw new Error("usePWAInstall must be used within PWAInstallProvider");
  return context;
}
