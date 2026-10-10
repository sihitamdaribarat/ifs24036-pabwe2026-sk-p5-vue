<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: { type: String, default: "" },
  height: { type: String, default: "260px" },
  placeholder: { type: String, default: "Tulis deskripsi barang lelang..." },
});
const emit = defineEmits(["update:modelValue"]);

const container = ref(null);
let editor = null;

onMounted(() => {
  editor = new Editor({
    el: container.value,
    height: props.height,
    initialEditType: "wysiwyg",
    previewStyle: "tab",
    hideModeSwitch: false,
    usageStatistics: false,
    placeholder: props.placeholder,
    initialValue: props.modelValue,
    toolbarItems: [
      ["heading", "bold", "italic", "strike"],
      ["ul", "ol", "task", "quote"],
      ["table", "link", "code"],
    ],
    events: {
      change: () => emit("update:modelValue", editor.getMarkdown()),
    },
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (editor && value !== editor.getMarkdown()) {
      editor.setMarkdown(value);
    }
  },
);

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="container" data-testid="markdown-editor" class="overflow-hidden rounded-xl" />
</template>
