// В браузере остаётся только сессия. Все рецепты и действия хранятся на сервере.
const SESSION_KEY = 'nk3-session';

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function saveSession(session, remember) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}
 
async function apiRequest(path, options = {}) {
  const headers = {};
  const session = readSession();
  if (session) headers.Authorization = 'Bearer ' + session.accessToken;
  if (options.body) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch('/api' + path, {
      method: options.method || 'GET', headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте подключение и повторите попытку.');
  }
  const data = await response.json();
  if (response.status === 401 && session) {
    clearSession();
    const next = location.pathname.split('/').pop() + location.search;
    location.href = 'login.html?expired=1&next=' + encodeURIComponent(next);
    throw new Error('Войдите снова: время действия сессии истекло.');
  }
  if (!response.ok) {
    const messages = {
      'Email already exists': 'Этот email уже зарегистрирован.',
      'Cannot find user': 'Неверный email или пароль.',
      'Incorrect password': 'Неверный email или пароль.',
      'Email format is invalid': 'Проверьте адрес электронной почты.',
      'Password is too short': 'Пароль слишком короткий.'
    };
    const message = typeof data === 'string' ? data : 'Не удалось выполнить запрос.';
    const error = new Error(messages[message] || message);
    error.status = response.status;
    throw error;
  }
  return data;
}
