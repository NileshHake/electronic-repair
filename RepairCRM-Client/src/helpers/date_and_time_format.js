export const formatDateTime = (date) => {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`; // 18/11/2025 22:47
};

// utils/colors.js
export const getTextColorClass = (classNames = "") => {
  if (!classNames) return "text-dark";

  const classes = classNames.split(" ").filter(Boolean);

  const hasOutline = classes.some((c) => c.includes("outline")); // btn-outline-*
  const isBgClass = classes.some((c) => c.startsWith("bg-"));

  // If it's outline (btn-outline-primary, etc.) → dark text
  if (hasOutline) {
    return "text-dark";
  }

  // Solid Bootstrap button & bg colors we treat as DARK backgrounds
  const darkSolidClasses = [
    "btn-primary",
    "btn-secondary",
    "btn-success",
    "btn-danger",
    "btn-dark",
    "btn-info",
    "bg-primary",
    "bg-secondary",
    "bg-success",
    "bg-danger",
    "bg-dark",
    "bg-info",
  ];

  // Light-ish / warning backgrounds → dark text
  const lightBgClasses = [
    "btn-light",
    "btn-outline-light",
    "btn-warning",
    "bg-light",
    "bg-warning",
    "bg-white",
  ];

  const hasDarkSolid = classes.some((c) => darkSolidClasses.includes(c));
  const hasLightBg = classes.some((c) => lightBgClasses.includes(c));

  if (hasDarkSolid) {
    return "text-white";
  }

  if (hasLightBg || isBgClass) {
    return "text-dark";
  }

  // Default fallback
  return "text-dark";
};
// utils/formatRemarkDateTime.js
export const formatRemarkDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";

  // expecting "DD/MM/YYYY HH:mm"
  const [datePart, timePart] = dateTimeString.split(" ");
  if (!datePart || !timePart) return dateTimeString;

  const [d, m, y] = datePart.split("/").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);

  const dt = new Date(y, m - 1, d, hh, mm);
  if (isNaN(dt.getTime())) return dateTimeString;

  const now = new Date();

  // normalize current date to midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const remarkDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const diffMs = today - remarkDay; // in ms
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  const fullDate = `${pad(d)}/${pad(m)}/${y}`;

  // today => only time
  if (diffDays === 0) {
    return time;
  }

  // yesterday or before => date + time
  return `${fullDate} ${time}`;
};
