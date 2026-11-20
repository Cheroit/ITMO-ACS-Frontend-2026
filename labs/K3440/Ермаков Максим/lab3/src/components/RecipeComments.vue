<script setup>
import { ref } from 'vue'
import { apiRequest } from '../api/client'
import { useFeedback } from '../composables/useFeedback'
import { useKitchen } from '../composables/useKitchen'
import { useRequest } from '../composables/useRequest'
import { useSession } from '../composables/useSession'
import { initials } from '../recipes'
import RequestStatus from './RequestStatus.vue'

const props = defineProps({ recipeId: { type: String, required: true } })
const { session } = useSession()
const { authorById } = useKitchen()
const { requireLogin, showNotice } = useFeedback()
const { data: comments, loading, error, reload } = useRequest(signal =>
  apiRequest('/comments', {
    params: { recipeId: props.recipeId, _sort: 'createdAt', _order: 'desc' },
    signal,
  }))

const text = ref('')
const submitting = ref(false)
const submitError = ref('')
const dateFormat = new Intl.DateTimeFormat('ru-RU')

function authorName(id) {
  return authorById(id).name
}

async function submit() {
  if (submitting.value || !requireLogin() || !text.value.trim()) return
  const data = { recipeId: props.recipeId, userId: session.value.user.id, text: text.value.trim() }
  submitting.value = true
  submitError.value = ''
  try {
    await apiRequest('/comments', { method: 'POST', data })
    text.value = ''
    reload()
    showNotice('Комментарий добавлен')
  } catch (failure) {
    submitError.value = failure.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="comments-section" aria-labelledby="commentsTitle">
    <h2 id="commentsTitle">За столом обсуждают <span class="comment-count">{{ comments?.length ?? 0 }}</span></h2>
    <form class="my-4" @submit.prevent="submit">
      <label class="form-label" for="comment">Ваш комментарий</label>
      <textarea id="comment" v-model="text" class="form-control mb-3" rows="3" :readonly="submitting"
        placeholder="Получилось вкусно? Поделитесь впечатлениями." required maxlength="1000"></textarea>
      <p v-if="submitError" class="alert alert-danger" role="alert">{{ submitError }}</p>
      <button class="btn btn-primary" type="submit" :disabled="submitting">Отправить</button>
    </form>
    <RequestStatus :loading="loading" :error="error" @retry="reload" />
    <div v-if="comments" aria-live="polite">
      <p v-if="comments.length === 0" class="empty-note">Здесь пока тихо. Оставьте первый комментарий!</p>
      <article v-for="comment in comments" :key="comment.id" class="comment">
        <span class="avatar" aria-hidden="true">{{ initials(authorName(comment.userId)) }}</span>
        <div>
          <h3>
            {{ authorName(comment.userId) }}
            <time :datetime="comment.createdAt">{{ dateFormat.format(new Date(comment.createdAt)) }}</time>
          </h3>
          <p>{{ comment.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
