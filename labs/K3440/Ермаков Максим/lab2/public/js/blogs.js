let articles = [];
const preview = document.body.dataset.page === 'home';

function openArticle(id) {
  const article = articles.find(item => item.id === id);
  if (!article) return;
  const author = cooks.find(cook => cook.id === article.authorId);
  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleAuthor').textContent = author.name + ' · ' + article.minutes + ' мин чтения';
  document.getElementById('articleText').innerHTML = article.paragraphs.map(text => '<p>' + escapeHTML(text) + '</p>').join('');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('articleModal')).show();
}

async function loadBlogs() {
  if (!preview) setPageLoading(true);
  try {
    await appReady;
    articles = await apiRequest('/articles');
    document.getElementById('articleList').innerHTML = articles.map((article, index) => {
      const author = cooks.find(cook => cook.id === article.authorId);
      const heading = preview ? 'h3' : 'h2';
      const action = preview
        ? `<a class="text-link mt-3" href="blogs.html?article=${encodeURIComponent(article.id)}">Читать заметку <i class="bi bi-arrow-right" aria-hidden="true"></i></a>`
        : `<button class="text-link btn btn-link px-0 mt-3" type="button" data-article="${escapeHTML(article.id)}">Читать заметку <i class="bi bi-arrow-right" aria-hidden="true"></i></button>`;
      return `<div class="col-md-6"><article class="blog-card ${index % 2 ? 'warm' : ''}"><span class="blog-tag">${escapeHTML(article.tag)}</span><${heading}>${escapeHTML(article.title)}</${heading}><p class="mt-3">${escapeHTML(article.description)}</p><div class="blog-author"><span class="avatar">${escapeHTML(getInitials(author.name))}</span>${escapeHTML(author.name)} <span class="small-note">· ${article.minutes} мин</span></div>${action}</article></div>`;
    }).join('');
    if (!preview) {
      document.getElementById('cookList').innerHTML = cooks.filter(cook => cook.id !== currentUser?.id).map(cook => `
        <div class="col-md-6"><article class="cook-card"><span class="avatar avatar-large">${escapeHTML(getInitials(cook.name))}</span><div><h3>${escapeHTML(cook.name)}</h3><p>${escapeHTML(cook.about)}</p></div><button type="button" class="btn btn-outline-primary" data-follow="${cook.id}">Подписаться</button></article></div>`).join('');
      updateActionButtons();
      setPageLoading(false);
      openArticle(new URLSearchParams(location.search).get('article'));
    }
  } catch (error) {
    if (preview) document.getElementById('articleList').textContent = 'Не удалось загрузить заметки. Обновите страницу.';
    else showPageError(error);
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-article]');
  if (button) openArticle(button.dataset.article);
});
loadBlogs();
