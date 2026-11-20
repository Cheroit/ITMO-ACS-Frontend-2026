<script setup>
defineProps({ loading: Boolean, error: { type: Error, default: null } })
defineEmits(['retry'])
</script>

<template>
  <p v-if="loading" class="small-note mb-4" role="status">Загружаем данные…</p>
  <div v-else-if="error" class="alert alert-danger mb-4" role="alert">
    {{ error.message }}
    <button class="btn btn-outline-primary ms-2" type="button" @click="$emit('retry')">Повторить</button>
  </div>
</template>
