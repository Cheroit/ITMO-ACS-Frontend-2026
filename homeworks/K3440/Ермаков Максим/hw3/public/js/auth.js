const authForm = document.getElementById('authForm');
const registration = document.body.dataset.page === 'register';
const error = document.getElementById('authError');

function showAuthError(message) {
  error.textContent = message;
  error.hidden = false;
  error.focus();
}

const params = new URLSearchParams(location.search);
const requestedNext = params.get('next') || 'profile.html';
const allowedPages = ['index.html', 'recipes.html', 'recipe.html', 'blogs.html', 'profile.html'];
const nextPage = allowedPages.includes(requestedNext.split('?')[0]) ? requestedNext : 'profile.html';
document.getElementById('authSwitch').href = (registration ? 'login.html' : 'register.html')
  + '?next=' + encodeURIComponent(nextPage);
if (params.has('expired')) {
  showAuthError('Время действия сессии истекло. Войдите снова.');
}

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  error.hidden = true;
  const form = authForm.elements;
  if (registration && form.password.value !== form.confirm.value) {
    showAuthError('Пароли не совпадают. Проверьте повторный ввод.');
    return;
  }
  const body = { email: form.email.value.trim().toLowerCase(), password: form.password.value };
  if (registration) {
    body.name = form.name.value.trim();
    if (body.name.length < 2) {
      showAuthError('Введите имя из двух или более символов.');
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
    showAuthError(requestError.message);
  } finally {
    button.disabled = false;
  }
});
