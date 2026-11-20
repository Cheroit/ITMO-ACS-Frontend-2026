<script setup>
import { reactive, ref } from 'vue'
import { apiRequest } from '../api/client'
import { useSession } from '../composables/useSession'
import { categories, difficulties, photos } from '../recipes'
import KitchenDialog from './KitchenDialog.vue'

const emit = defineEmits(['close', 'published'])
const { session } = useSession()
const error = ref('')
const pending = ref(false)
const form = reactive({
  title: '',
  type: categories[0],
  difficulty: difficulties[0],
  time: 30,
  portions: 2,
  image: 'pasta.jpg',
  description: '',
  ingredients: '',
  steps: '',
})

function lines(value) {
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

async function publish() {
  if (pending.value || !session.value) return
  const ingredients = lines(form.ingredients).map(line => {
    const [name, ...amount] = line.split('—')
    return [name.trim(), amount.join('—').trim()]
  })
  const steps = lines(form.steps).map((step, index) => [`Шаг ${index + 1}`, step])
  if (!form.title.trim() || !ingredients.length || ingredients.some(([name]) => !name) || !steps.length) {
    error.value = 'Заполните название, ингредиенты и шаги приготовления.'
    return
  }

  pending.value = true
  error.value = ''
  try {
    await apiRequest('/recipes', {
      method: 'POST',
      data: {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        ingredients,
        steps,
        userId: session.value.user.id,
      },
    })
    emit('published')
  } catch (failure) {
    error.value = failure.message
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <KitchenDialog title="Поделитесь вкусным" wide @close="emit('close')">
    <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
    <form id="publishForm" @submit.prevent="publish">
      <fieldset :disabled="pending">
        <div class="mb-3">
          <label class="form-label" for="publishName">Название рецепта</label>
          <input id="publishName" v-model="form.title" class="form-control" placeholder="Например, любимый пирог" required maxlength="80" />
        </div>
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <label class="form-label" for="publishType">Тип блюда</label>
            <select id="publishType" v-model="form.type" class="form-select">
              <option v-for="type in categories" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="publishDifficulty">Сложность</label>
            <select id="publishDifficulty" v-model="form.difficulty" class="form-select">
              <option v-for="difficulty in difficulties" :key="difficulty">{{ difficulty }}</option>
            </select>
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <label class="form-label" for="publishTime">Время, минут</label>
            <input id="publishTime" v-model.number="form.time" class="form-control" type="number" min="1" max="1440" required />
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="publishPortions">Количество порций</label>
            <input id="publishPortions" v-model.number="form.portions" class="form-control" type="number" min="1" max="30" required />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="publishImage">Фото блюда</label>
          <select id="publishImage" v-model="form.image" class="form-select">
            <option v-for="(label, filename) in photos" :key="filename" :value="filename">{{ label }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="publishDescription">Короткое описание</label>
          <textarea id="publishDescription" v-model="form.description" class="form-control" rows="2" required maxlength="300"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label" for="publishIngredients">Ингредиенты</label>
          <textarea id="publishIngredients" v-model="form.ingredients" class="form-control" rows="3" required maxlength="2000"
            placeholder="Паста — 200 г" aria-describedby="publishIngredientHint"></textarea>
          <p id="publishIngredientHint" class="small-note mt-1 mb-0">Каждый ингредиент с новой строки. Количество можно указать после тире.</p>
        </div>
        <div>
          <label class="form-label" for="publishSteps">Шаги приготовления</label>
          <textarea id="publishSteps" v-model="form.steps" class="form-control" rows="4" required maxlength="5000"
            aria-describedby="publishStepHint"></textarea>
          <p id="publishStepHint" class="small-note mt-1 mb-0">Каждый шаг с новой строки.</p>
        </div>
      </fieldset>
    </form>
    <template #footer="{ close }">
      <button class="btn btn-outline-primary" type="button" @click="close">Отмена</button>
      <button class="btn btn-primary" type="submit" form="publishForm" :disabled="pending">Опубликовать рецепт</button>
    </template>
  </KitchenDialog>
</template>
