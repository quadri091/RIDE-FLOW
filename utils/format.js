function formatTimestamp(timestamp) {
  const d = new Date(timestamp);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${mm}/${dd}/${yyyy} - ${String(hours).padStart(2, "0")}:${minutes}${ampm}`;
}

module.exports = formatTimestamp;
