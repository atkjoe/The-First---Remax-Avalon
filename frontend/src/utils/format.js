export function currency(value) {
  const number = Number(value || 0);
  return `${number.toLocaleString()} EGP`;
}

export function date(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function number(value, fallback = "-") {
  if (value === undefined || value === null || value === "") return fallback;
  return Number(value).toLocaleString();
}
