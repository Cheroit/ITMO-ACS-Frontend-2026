<script setup>
import FollowButton from './FollowButton.vue'
import { initials } from '../recipes'

defineProps({ author: { type: Object, required: true } })
</script>

<template>
  <article class="cook-card">
    <span class="avatar avatar-large" aria-hidden="true">{{ initials(author.name) }}</span>
    <div><h3>{{ author.name }}</h3><p>{{ author.about }}</p></div>
    <FollowButton :author-id="author.id" />
  </article>
</template>
