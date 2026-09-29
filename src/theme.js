import { useSyncExternalStore } from "react";

// Light / dark theme. Follows the visitor's OS setting until they pick one
// with the navbar toggle; the pick is remembered. The inline script in
// index.html applies the class before first paint, this module keeps it in sync.

const KEY = "armorix_theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

// Shared by every particle material, so one assignment re-tints all 3D scenes.
export const darkUniform = { value: 0 };

const stored = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

let theme = stored() || (media.matches ? "dark" : "light");

const apply = () => {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0b0c0f" : "#f4f4f1");
  darkUniform.value = dark ? 1 : 0;
  listeners.forEach((fn) => fn());
};
apply();

media.addEventListener("change", (e) => {
  if (stored()) return; // an explicit choice wins over the OS
  theme = e.matches ? "dark" : "light";
  apply();
});

export const toggleTheme = () => {
  theme = theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // storage can be unavailable (private mode); the switch still applies
  }
  apply();
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useTheme = () => useSyncExternalStore(subscribe, () => theme);
