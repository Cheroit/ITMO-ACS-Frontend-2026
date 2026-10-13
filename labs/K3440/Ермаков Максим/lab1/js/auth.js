const authForm = document.getElementById('authForm');
const registration = document.body.dataset.page === 'register';

// Разрешаем возврат только на страницы нашего сайта.
const requestedNext = new URLSearchParams(location.search).get('next') || 'profile.html';
const allowedPages = ['index.html', 'recipes.html', 'recipe.html', 'blogs.html', 'profile.html'];
const nextPage = allowedPages.includes(requestedNext.split('?')[0]) ? requestedNext : 'profile.html';
document.getElementById('authSwitch').href = (registration ? 'login.html' : 'register.html') + '?next=' + encodeURIComponent(nextPage);

authForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const email = authForm.elements.email.value.trim().toLowerCase();
  const password = authForm.elements.password.value;
  const error = document.getElementById('authError');
  error.hidden = true;

  if (registration && password !== authForm.elements.confirm.value) {
    error.textContent = 'Пароли не совпадают. Проверьте повторный ввод.';
    error.hidden = false;
    authForm.elements.confirm.focus();
    return;
  }

  let user;
  if (registration) {
    const name = authForm.elements.name.value.trim();
    if (name.length < 2) {
      error.textContent = 'Введите имя из двух или более символов.';
      error.hidden = false;
      return;
    }
    user = { name, email };
    localStorage.setItem('nk-account', JSON.stringify(user));
  } else {
    const account = readStorage('nk-account', null);
    user = account && account.email === email ? account : { name: email.split('@')[0], email };
  }

  // Это демонстрация входа для ЛР1. Пароли нигде не сохраняются.
  localStorage.removeItem('nk-user');
  sessionStorage.removeItem('nk-user');
  const storage = registration || authForm.elements.remember.checked ? localStorage : sessionStorage;
  storage.setItem('nk-user', JSON.stringify(user));
  location.href = nextPage;
});
