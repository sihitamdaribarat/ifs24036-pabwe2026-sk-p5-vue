<script setup>
import { computed, ref } from "vue";
import { Gavel, Loader2 } from "lucide-vue-next";
import BaseModal from "../components/BaseModal.vue";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, getHighestBid, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  open: { type: Boolean, default: false },
  aucation: { type: Object, required: true },
});
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const [bid, , setBid] = useInput("");
const error = ref("");

const highestBid = computed(() => getHighestBid(props.aucation.bids));
const minimumText = computed(() =>
  highestBid.value === null
    ? `Minimal ${formatRupiah(props.aucation.start_bid)} (harga awal)`
    : `Harus lebih dari ${formatRupiah(highestBid.value)} (tawaran tertinggi)`,
);

function validate(amount) {
  if (!(amount > 0)) return "Nominal tawaran wajib diisi";
  if (highestBid.value !== null && amount <= highestBid.value) {
    return "Tawaran harus lebih tinggi dari tawaran tertinggi saat ini";
  }
  if (amount < Number(props.aucation.start_bid)) {
    return "Tawaran tidak boleh kurang dari harga awal";
  }
  return "";
}

async function onSubmit() {
  const amount = Number(bid.value);
  error.value = validate(amount);
  if (error.value) return;

  const result = await aucationsStore.addBid(props.aucation.id, amount);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  setBid("");
  showSuccessDialog(result.message || "Tawaran berhasil diajukan");
  emit("saved");
  emit("close");
}
</script>

<template>
  <BaseModal :open="open" title="Ajukan Tawaran" :description="aucation.title" @close="emit('close')">
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div>
          <p class="text-slate-500">Harga Awal</p>
          <p class="font-semibold text-slate-800">{{ formatRupiah(aucation.start_bid) }}</p>
        </div>
        <div>
          <p class="text-slate-500">Tawaran Tertinggi</p>
          <p data-testid="bid-highest" class="font-semibold text-emerald-600">
            {{ highestBid === null ? "Belum ada" : formatRupiah(highestBid) }}
          </p>
        </div>
      </div>

      <div>
        <label for="bid-amount" class="mb-1.5 block text-sm font-medium text-slate-700">Nominal Tawaran (Rp)</label>
        <input
          id="bid-amount"
          v-model="bid"
          type="number"
          min="1"
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p class="mt-1 text-xs text-slate-500">{{ minimumText }}</p>
        <p v-if="error" class="mt-1 text-xs text-rose-600">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="aucationsStore.isBidAdd"
          class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <component :is="aucationsStore.isBidAdd ? Loader2 : Gavel" :class="['h-4 w-4', { 'animate-spin': aucationsStore.isBidAdd }]" />
          Ajukan Tawaran
        </button>
      </div>
    </form>
  </BaseModal>
</template>
