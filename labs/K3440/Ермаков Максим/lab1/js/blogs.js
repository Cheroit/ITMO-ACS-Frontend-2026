document.getElementById('cookList').innerHTML = cooks.map(cook => `
  <div class="col-md-6"><article class="cook-card"><span class="avatar avatar-large">${cook.initials}</span><div><h3>${cook.name}</h3><p>${cook.about}</p></div><button type="button" class="btn btn-outline-primary" data-follow="${cook.id}">Подписаться</button></article></div>`).join('');

document.querySelectorAll('[data-article]').forEach(button => {
  button.addEventListener('click', function () {
    const article = articles.find(item => item.id === button.dataset.article);
    const author = cooks.find(cook => cook.id === article.authorId);
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleAuthor').textContent = author.name + ' · ' + article.minutes + ' мин чтения';
    document.getElementById('articleText').innerHTML = article.paragraphs.map(text => '<p>' + escapeHTML(text) + '</p>').join('');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('articleModal')).show();
  });
});
updateActionButtons();

const requestedArticle = new URLSearchParams(location.search).get('article');
if (requestedArticle) document.querySelector(`[data-article="${CSS.escape(requestedArticle)}"]`)?.click();
