<script setup>
import { X } from "lucide-vue-next";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  size: { type: String, default: "max-w-lg" },
});
const emit = defineEmits(["close"]);
</script>

<template>
  <div
    v-if="open"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    class="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 sm:items-center sm:p-4"
  >
    <div data-testid="modal-backdrop" class="absolute inset-0" @click="emit('close')" />
    <div :class="['relative w-full rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', size]">
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
          <p v-if="description" class="mt-0.5 text-sm text-slate-500">{{ description }}</p>
        </div>
        <button
          type="button"
          data-testid="modal-close"
          aria-label="Tutup"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <div class="max-h-[75vh] overflow-y-auto px-6 py-5">
        <slot />
      </div>
    </div>
  </div>
</template>
