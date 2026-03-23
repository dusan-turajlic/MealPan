"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";

export default function UpdateBanner() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const hadController = !!navigator.serviceWorker.controller;

    const handleControllerChange = () => {
      if (hadController) setShow(true);
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-accent text-on-accent text-center cursor-pointer py-3 font-medium"
      onClick={() => location.reload()}
    >
      {t.updateAvailable}
    </div>
  );
}
