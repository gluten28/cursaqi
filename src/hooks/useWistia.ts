// src/hooks/useWistia.ts

import { useEffect, useState } from "react";

let loaded = false;

export function useWistia() {

  const [ready, setReady] = useState(loaded);

  useEffect(() => {

    if (loaded) {
      setReady(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://fast.wistia.com/player.js"]'
    );

    if (existing) {
      loaded = true;
      setReady(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://fast.wistia.com/player.js";

    script.async = true;

    script.onload = () => {

      loaded = true;

      setReady(true);

    };

    document.body.appendChild(script);

  }, []);

  return ready;

}