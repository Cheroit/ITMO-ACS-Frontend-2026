const jsonServer = require('json-server');
const auth = require('json-server-auth');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

// Начальная база копируется только при первом запуске. Дальше JSON Server
// сохраняет регистрации и действия пользователей в db.json.
const dbFile = process.env.DB_FILE || path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) fs.copyFileSync(path.join(__dirname, 'seed.json'), dbFile);

const server = jsonServer.create();
const router = jsonServer.router(dbFile);
server.db = router.db; // Эта связь нужна json-server-auth для работы с users.
server.use(jsonServer.defaults({ static: path.join(__dirname, 'public'), logger: false }));
server.use(jsonServer.bodyParser);

// Публичные карточки авторов не содержат email и хешей паролей.
server.get('/api/authors', (req, res) => {
  const authors = server.db.get('users').value().map(user => ({
    id: user.id, name: user.name,
    about: user.about || 'Делится домашними рецептами'
  }));
  res.json(authors);
});

// Открываем только нужные приложению маршруты. Служебный /db и прямой
// доступ к users не нужны: для аккаунтов есть /register и /login.
server.use('/api', (req, res, next) => {
  if (req.method === 'POST' && ['/register', '/login'].includes(req.path)) {
    const { email, password, name } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json('Введите email и пароль не короче 6 символов.');
    }
    req.body = { email: email.trim().toLowerCase(), password };
    if (req.path === '/register') {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
        return res.status(400).json('Имя должно содержать от 2 до 60 символов.');
      }
      req.body.name = name.trim();
    }
    return next();
  }
  if (!/^\/(recipes|articles|comments|likes|saved|following)(\/[^/]+)?$/.test(req.path)) {
    return res.status(404).json('Маршрут не найден.');
  }
  if (req.query._expand || req.query._embed) {
    return res.status(400).json('Вложенные ресурсы не используются.');
  }
  next();
});

// 664: читать могут все, записывать — только вошедшие пользователи.
// 660: читать и записывать могут только вошедшие пользователи.
// 444: только чтение. JWT проверяет готовый модуль json-server-auth.
server.use('/api', auth.rewriter({
  recipes: 664, articles: 444, comments: 664,
  likes: 664, saved: 660, following: 660
}));
server.use('/api', auth);

// Дополняем проверку токена проверкой владельца записи и данных формы.
// req.claims.sub содержит id пользователя из проверенного JWT.
server.use('/api', (req, res, next) => {
  const [collection, id] = req.path.slice(1).split('/');
  const records = server.db.get(collection).value();
  const record = id ? records.find(item => String(item.id) === id) : null;
  const userId = req.claims ? Number(req.claims.sub) : null;
  const privateList = ['saved', 'following'].includes(collection);

  if (id && !record) return res.status(404).json('Запись не найдена.');
  if (req.method === 'GET') {
    if (privateList) {
      if (id && record.userId !== userId) return res.status(403).json('Это запись другого пользователя.');
      // Фильтр задаёт сервер: подмена userId в адресе не откроет чужой список.
      req.query.userId = String(userId);
    }
    return next();
  }
  if (req.method === 'DELETE' && ['saved', 'following', 'likes'].includes(collection)) {
    if (!record || record.userId !== userId) return res.status(403).json('Это запись другого пользователя.');
    return next();
  }
  if (req.method !== 'POST' || id) return res.status(405).json('Метод не поддерживается.');
  if (Number(req.body.userId) !== userId) return res.status(403).json('Неверный владелец записи.');

  const data = req.body;
  if (collection === 'recipes') {
    const images = ['pasta.jpg', 'soup.jpg', 'pizza.jpg', 'omelette.jpg', 'cupcakes.jpg', 'skewers.jpg'];
    const validText = typeof data.title === 'string' && data.title.trim() && data.title.length <= 80
      && typeof data.description === 'string' && data.description.trim() && data.description.length <= 300;
    const validNumbers = Number.isInteger(data.time) && data.time >= 1 && data.time <= 1440
      && Number.isInteger(data.portions) && data.portions >= 1 && data.portions <= 30;
    const validLists = [data.ingredients, data.steps].every(list => Array.isArray(list)
      && list.length > 0 && list.length <= 50 && list.every(item => Array.isArray(item)
        && item.length === 2 && item.every(text => typeof text === 'string' && text.length <= 1000)
        && item[0].trim()));
    if (!validText || !validNumbers || !validLists || !images.includes(data.image)
      || !['Завтраки', 'Основные блюда', 'Супы', 'Десерты'].includes(data.type)
      || !['Легко', 'Средне'].includes(data.difficulty)) {
      return res.status(400).json('Проверьте название, описание, время, порции, ингредиенты и шаги.');
    }
    req.body = {
      id: randomUUID(), userId, title: data.title.trim(), description: data.description.trim(),
      type: data.type, difficulty: data.difficulty, time: data.time, portions: data.portions,
      image: data.image, ingredients: data.ingredients, steps: data.steps, likes: 0
    };
  } else if (collection === 'following') {
    const authorId = Number(data.authorId);
    if (authorId === userId || !server.db.get('users').find({ id: authorId }).value()) {
      return res.status(400).json('Выберите другого автора.');
    }
    req.body = { userId, authorId };
  } else {
    const recipeId = String(data.recipeId || '');
    if (!server.db.get('recipes').find({ id: recipeId }).value()) {
      return res.status(404).json('Рецепт не найден.');
    }
    req.body = { userId, recipeId };
    if (collection === 'comments') {
      if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 1000) {
        return res.status(400).json('Комментарий должен содержать от 1 до 1000 символов.');
      }
      req.body.text = data.text.trim();
      req.body.createdAt = new Date().toISOString();
    }
  }
  if (['saved', 'likes', 'following'].includes(collection)) {
    const duplicate = records.some(item => item.userId === userId
      && (collection === 'following' ? item.authorId === req.body.authorId : item.recipeId === req.body.recipeId));
    if (duplicate) return res.status(409).json('Эта запись уже добавлена.');
  }
  next();
});

server.use('/api', router);
const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`На кухне: http://localhost:${port}`));
