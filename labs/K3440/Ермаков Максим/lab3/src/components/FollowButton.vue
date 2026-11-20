<script setup>
import { computed } from 'vue'
import { useKitchen } from '../composables/useKitchen'

const props = defineProps({ authorId: { type: [String, Number], required: true } })
const { hasReaction, actionPending, toggleReaction } = useKitchen()
const following = computed(() => hasReaction('following', props.authorId))
</script>

<template>
  <button class="btn btn-outline-primary" type="button" :aria-pressed="following"
    :disabled="actionPending('following', authorId)" @click="toggleReaction('following', authorId)">
    {{ following ? 'Вы подписаны' : 'Подписаться' }}
  </button>
</template>
