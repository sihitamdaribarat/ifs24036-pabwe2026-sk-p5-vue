/**
 * Menjalankan aksi async pada store sambil mengelola flag status.
 * - loadingKey bernilai true selama aksi berjalan.
 * - doneKey (opsional) di-reset ke false lalu bernilai true bila aksi berhasil.
 * Aksi mengembalikan pesan sukses (string).
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function runAction(store, loadingKey, doneKey, action) {
  store[loadingKey] = true;
  if (doneKey) store[doneKey] = false;
  try {
    const message = await action();
    if (doneKey) store[doneKey] = true;
    return { success: true, message };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    store[loadingKey] = false;
  }
}
