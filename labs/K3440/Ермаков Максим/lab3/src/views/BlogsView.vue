<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '../api/client'
import ArticleCard from '../components/ArticleCard.vue'
import AuthorCard from '../components/AuthorCard.vue'
import KitchenDialog from '../components/KitchenDialog.vue'
import RequestStatus from '../components/RequestStatus.vue'
import { useKitchen } from '../composables/useKitchen'
import { useRequest } from '../composables/useRequest'
import { useSession } from '../composables/useSession'

const route = useRoute()
const router = useRouter()
const { session } = useSession()
const { collections, authorById, loading: authorsLoading } = useKitchen()
const { data: articles, loading, error, reload } = useRequest(signal => apiRequest('/articles', { signal }))
const authors = computed(() => collections.authors.filter(author => author.id !== session.value?.user.id))
const selected = computed(() => articles.value?.find(article => article.id === route.query.article))

function closeArticle() {
  const { article, ...query } = route.query
  router.replace({ name: 'blogs', query })
}
</script>

<template>
  <div class="page-heading">
    <span class="eyebrow">Люди, еда и истории</span>
    <h1>Кухонные заметки</h1>
    <p>Советы, маленькие открытия и вдохновение от наших кулинаров.</p>
  </div>
  <RequestStatus :loading="loading" :error="error" @retry="reload" />
  <p v-if="articles && route.query.article && !selected" class="alert alert-warning" role="status">Заметка не найдена.</p>
  <section v-if="articles" class="row g-4" aria-label="Статьи кулинаров">
    <div v-for="(article, index) in articles" :key="article.id" class="col-md-6">
      <ArticleCard :article="article" :warm="index % 2 === 1" />
    </div>
  </section>
  <section class="section-space" aria-labelledby="cooksTitle">
    <h2 id="cooksTitle" class="mb-4">Знакомьтесь с кулинарами</h2>
    <RequestStatus :loading="authorsLoading" />
    <div class="row g-4">
      <div v-for="author in authors" :key="author.id" class="col-md-6"><AuthorCard :author="author" /></div>
    </div>
  </section>
  <KitchenDialog v-if="selected" :key="selected.id" :title="selected.title" wide @close="closeArticle">
    <p class="small-note mb-4">{{ authorById(selected.authorId).name }} · {{ selected.minutes }} мин чтения</p>
    <div class="article-text">
      <p v-for="(paragraph, index) in selected.paragraphs" :key="index">{{ paragraph }}</p>
    </div>
  </KitchenDialog>
</template>
