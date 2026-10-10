import Swal from "sweetalert2";

const baseDialog = {
  confirmButtonColor: "#4f46e5",
  cancelButtonColor: "#94a3b8",
  customClass: { popup: "rounded-2xl" },
};

export function showSuccessDialog(message, title = "Berhasil") {
  return Swal.fire({ ...baseDialog, icon: "success", title, text: message });
}

export function showErrorDialog(message, title = "Gagal") {
  return Swal.fire({ ...baseDialog, icon: "error", title, text: message });
}

export async function showConfirmDialog(
  message,
  title = "Apakah kamu yakin?",
  confirmText = "Ya, lanjutkan",
) {
  const result = await Swal.fire({
    ...baseDialog,
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#e11d48",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export function formatRupiah(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

/** Mengubah "YYYY-MM-DD HH:MM:SS" maupun ISO string menjadi Date. */
export function parseDate(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Format untuk input datetime-local: "YYYY-MM-DDTHH:MM". */
export function toDateTimeLocal(value) {
  const date = parseDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Format timestamp untuk API: "YYYY-MM-DD HH:MM:SS". */
export function toApiDateTime(value) {
  const local = toDateTimeLocal(value);
  return local ? `${local.replace("T", " ")}:00` : "";
}

export function isClosed(closedAt, now = Date.now()) {
  const date = parseDate(closedAt);
  return !date || date.getTime() <= now;
}

/** Sisa waktu menuju closedAt dalam bentuk teks singkat. */
export function formatCountdown(closedAt, now = Date.now()) {
  const date = parseDate(closedAt);
  const diff = date ? date.getTime() - now : 0;
  if (diff <= 0) return "Ditutup";

  const minutes = Math.floor(diff / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) return `${days}h ${hours}j lagi`;
  if (hours > 0) return `${hours}j ${mins}m lagi`;
  return `${mins}m lagi`;
}

/** Tawaran tertinggi dari daftar bid (objek dengan field bid), atau null. */
export function getHighestBid(bids) {
  const values = (Array.isArray(bids) ? bids : [])
    .map((item) => Number(item?.bid))
    .filter((value) => !Number.isNaN(value));
  return values.length > 0 ? Math.max(...values) : null;
}
