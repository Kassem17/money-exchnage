// src/utils/formatters.js
export function formatWithCommas(number) {
  if (number === null || number === undefined) return "";

  const [integer, decimal] = number.toString().split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal ? `${formatted}.${decimal}` : formatted;
}

/**
 * Format a numeric string or number to have commas every 3 digits.
 *
 * @param {string | number} value - The number to format.
 * @returns {string} - Formatted number with commas.
 */
export function formatNumberWithCommas(value) {
  if (value == null) return "";

  const parts = value
    .toString()
    .replace(/[^\d.]/g, "")
    .split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
