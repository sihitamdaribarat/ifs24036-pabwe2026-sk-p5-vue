import { parseDate, toApiDateTime } from "../../../helpers/toolsHelper";

/**
 * Validasi form lelang (tambah / ubah).
 * @returns {Record<string, string>} pesan error per field, kosong bila valid.
 */
export function validateAucationForm(values, { requireFuture = true, now = Date.now() } = {}) {
  const errors = {};
  if (values.title.trim().length < 3) {
    errors.title = "Judul minimal 3 karakter";
  }
  if (values.description.trim().length === 0) {
    errors.description = "Deskripsi wajib diisi";
  }
  if (!(Number(values.startBid) > 0)) {
    errors.startBid = "Harga awal harus lebih dari 0";
  }
  const closedAt = parseDate(values.closedAt);
  if (!closedAt) {
    errors.closedAt = "Batas waktu wajib diisi";
  } else if (requireFuture && closedAt.getTime() <= now) {
    errors.closedAt = "Batas waktu harus di masa depan";
  }
  return errors;
}

export function toAucationPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description,
    startBid: Number(values.startBid),
    closedAt: toApiDateTime(values.closedAt),
  };
}
