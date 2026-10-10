<script setup>
import { computed } from "vue";
import BaseModal from "../components/BaseModal.vue";
import AucationForm from "../components/AucationForm.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { toAucationPayload } from "../utils/aucationForm";
import { showErrorDialog, showSuccessDialog, toDateTimeLocal } from "../../../helpers/toolsHelper";

const props = defineProps({
  open: { type: Boolean, default: false },
  aucation: { type: Object, required: true },
});
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();

const initial = computed(() => ({
  title: props.aucation.title,
  description: props.aucation.description,
  startBid: props.aucation.start_bid,
  closedAt: toDateTimeLocal(props.aucation.closed_at),
}));

async function onSubmit(values) {
  const result = await aucationsStore.changeAucation(props.aucation.id, toAucationPayload(values));
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Lelang berhasil diperbarui");
  emit("saved");
  emit("close");
}
</script>

<template>
  <BaseModal :open="open" title="Ubah Lelang" size="max-w-2xl" @close="emit('close')">
    <AucationForm
      :initial="initial"
      :submitting="aucationsStore.isAucationChange"
      :require-future="false"
      submit-label="Simpan Perubahan"
      @submit="onSubmit"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
