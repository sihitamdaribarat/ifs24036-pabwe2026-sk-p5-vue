import { ref } from "vue";

/**
 * Composable untuk mengelola nilai input form.
 * @returns {[import("vue").Ref, (event: Event) => void, (value?: any) => void]}
 *   [value, onChange, setValue] — value dapat langsung dipakai dengan v-model.
 */
export function useInput(defaultValue = "") {
  const value = ref(defaultValue);

  function onChange(event) {
    value.value = event.target.value;
  }

  function setValue(newValue = defaultValue) {
    value.value = newValue;
  }

  return [value, onChange, setValue];
}

export default useInput;
