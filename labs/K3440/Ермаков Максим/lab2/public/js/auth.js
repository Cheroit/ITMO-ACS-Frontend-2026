const authForm = document.getElementById('authForm');
const registration = document.body.dataset.page === 'register';
const error = document.getElementById('authError');

const params = new URLSearchParams(location.search);
const requestedNext = params.get('next') || 'profile.html';
const allowedPages = ['index.html', 'recipes.html', 'recipe.html', 'blogs.html', 'profile.html'];
const nextPage = allowedPages.includes(requestedNext.split('?')[0]) ? requestedNext : 'profile.html';
document.getElementById('authSwitch').href = (registration ? 'login.html' : 'register.html')
  + '?next=' + encodeURIComponent(nextPage);
if (params.has('expired')) {
  error.textContent = 'Время действия сессии истекло. Войдите снова.';
  error.hidden = false;
}

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  error.hidden = true;
  const form = authForm.elements;
  if (registration && form.password.value !== form.confirm.value) {
    error.textContent = 'Пароли не совпадают. Проверьте повторный ввод.';
    error.hidden = false;
    form.confirm.focus();
    return;
  }
  const body = { email: form.email.value.trim().toLowerCase(), password: form.password.value };
  if (registration) {
    body.name = form.name.value.trim();
    if (body.name.length < 2) {
      error.textContent = 'Введите имя из двух или более символов.';
      error.hidden = false;
      return;
    }
  }
  const button = authForm.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const session = await apiRequest(registration ? '/register' : '/login', { method: 'POST', body });
    saveSession(session, registration || form.remember.checked);
    location.href = nextPage;
  } catch (requestError) {
    error.textContent = requestError.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
  }
});
