<script setup>
import { onMounted, onBeforeUnmount, ref, useId } from 'vue'

defineProps({ title: { type: String, required: true }, wide: Boolean })
defineEmits(['close'])

const dialog = ref(null)
const titleId = useId()
let previousFocus

onMounted(() => {
  previousFocus = document.activeElement
  dialog.value.showModal()
})
onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
})

function close() {
  dialog.value.close()
}
</script>

<template>
  <dialog
    ref="dialog" class="kitchen-dialog modal-content" :class="{ 'kitchen-dialog-wide': wide }"
    :aria-labelledby="titleId" @close="$emit('close')" @click.self="close"
  >
    <div class="modal-header">
      <h2 :id="titleId" class="modal-title">{{ title }}</h2>
      <button class="btn-close" type="button" aria-label="Закрыть" @click="close"></button>
    </div>
    <div class="modal-body"><slot /></div>
    <div v-if="$slots.footer" class="modal-footer"><slot name="footer" :close="close" /></div>
  </dialog>
</template>
