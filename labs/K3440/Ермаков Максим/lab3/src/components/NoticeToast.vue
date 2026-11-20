<script setup>
import { watch } from 'vue'
import { useFeedback } from '../composables/useFeedback'

const { notice } = useFeedback()

watch(notice, (value, _, onCleanup) => {
  if (!value) return
  const timer = setTimeout(() => { notice.value = null }, 3500)
  onCleanup(() => clearTimeout(timer))
})
</script>

<template>
  <div class="notice-container" role="status" aria-live="polite" aria-atomic="true">
    <div v-if="notice" class="toast show align-items-center">
      <div class="d-flex">
        <div class="toast-body">{{ notice.message }}</div>
        <button class="btn-close me-3 m-auto" type="button" aria-label="Закрыть уведомление" @click="notice = null"></button>
      </div>
    </div>
  </div>
</template>
