<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useKitchen } from '../composables/useKitchen'
import { initials } from '../recipes'

const props = defineProps({ article: { type: Object, required: true }, warm: Boolean, preview: Boolean })
const { authorById } = useKitchen()
const author = computed(() => authorById(props.article.authorId))
</script>

<template>
  <article class="blog-card" :class="{ warm }">
    <span class="blog-tag">{{ article.tag }}</span>
    <component :is="preview ? 'h3' : 'h2'">{{ article.title }}</component>
    <p class="mt-3">{{ article.description }}</p>
    <div class="blog-author">
      <span class="avatar" aria-hidden="true">{{ initials(author.name) }}</span>{{ author.name }}
      <span class="small-note">· {{ article.minutes }} мин</span>
    </div>
    <RouterLink
      class="text-link mt-3" :to="{ name: 'blogs', query: { article: article.id } }"
      :aria-label="'Читать заметку: ' + article.title"
    >
      Читать заметку <i class="bi bi-arrow-right" aria-hidden="true"></i>
    </RouterLink>
  </article>
</template>
