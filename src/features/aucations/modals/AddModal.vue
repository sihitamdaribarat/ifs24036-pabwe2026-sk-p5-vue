<script setup>
import BaseModal from "../components/BaseModal.vue";
import AucationForm from "../components/AucationForm.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { toAucationPayload } from "../utils/aucationForm";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();

async function onSubmit(values) {
  const result = await aucationsStore.addAucation(toAucationPayload(values));
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Lelang berhasil dibuat");
  emit("saved");
  emit("close");
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Buat Lelang Baru"
    description="Cover barang dapat diunggah setelah lelang dibuat."
    size="max-w-2xl"
    @close="emit('close')"
  >
    <AucationForm
      :submitting="aucationsStore.isAucationAdd"
      submit-label="Buat Lelang"
      @submit="onSubmit"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
