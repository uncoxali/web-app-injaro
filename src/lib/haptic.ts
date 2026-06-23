export function haptic(type: "light" | "medium" | "heavy" = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  const durations = { light: 10, medium: 20, heavy: 40 };
  navigator.vibrate(durations[type]);
}
