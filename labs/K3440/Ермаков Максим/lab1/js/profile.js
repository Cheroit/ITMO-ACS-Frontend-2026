if (!currentUser) {
  location.replace('login.html?next=profile.html');
} else {
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileAvatar').textContent = getInitials(currentUser.name);
  document.getElementById('profileEmail').textContent = currentUser.email;

  function renderProfile() {
    const savedIds = getUserList('saved');
    const saved = getRecipes().filter(recipe => savedIds.includes(recipe.id));
    const publications = getRecipes().filter(recipe => recipe.authorId === currentUser.email);
    const following = cooks.filter(cook => getUserList('following').includes(cook.id));
    renderCards(document.getElementById('savedRecipes'), saved);
    renderCards(document.getElementById('myRecipes'), publications);
    document.getElementById('savedEmpty').hidden = saved.length > 0;
    document.getElementById('publicationsEmpty').hidden = publications.length > 0;
    document.getElementById('followingEmpty').hidden = following.length > 0;
    document.getElementById('savedCount').textContent = saved.length;
    document.getElementById('publicationCount').textContent = publications.length;
    document.getElementById('followingCount').textContent = following.length;
    document.getElementById('followingList').innerHTML = following.map(cook => `
      <div class="col-md-6"><article class="cook-card"><span class="avatar avatar-large">${cook.initials}</span><div><h3>${cook.name}</h3><p>${cook.about}</p></div><button class="btn btn-outline-primary" type="button" data-follow="${cook.id}">Вы подписаны</button></article></div>`).join('');
  }

  document.addEventListener('savedChanged', renderProfile);
  document.addEventListener('followingChanged', renderProfile);

  document.getElementById('publishForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const form = this.elements;
    const title = form.title.value.trim();
    const ingredients = form.ingredients.value.trim().split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('—');
      return [parts[0].trim(), (parts[1] || '').trim()];
    });
    const steps = form.steps.value.trim().split('\n').filter(line => line.trim()).map((line, index) => ['Шаг ' + (index + 1), line.trim()]);
    const url = new URL(form.video.value);
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    const validHost = ['youtu.be', 'www.youtube.com', 'youtube.com'].includes(url.hostname);
    const error = document.getElementById('publishError');
    error.hidden = true;
    if (!title || !ingredients.length || !steps.length || !validHost || !/^[\w-]{11}$/.test(videoId || '')) {
      error.textContent = 'Заполните название, ингредиенты, шаги и укажите ссылку на видео YouTube.';
      error.hidden = false;
      return;
    }
    const recipe = {
      id: 'recipe-' + Date.now(), title, type: form.type.value, difficulty: form.difficulty.value,
      time: Number(form.time.value), portions: Number(form.portions.value), image: form.image.value,
      description: form.description.value.trim(), authorId: currentUser.email, authorName: currentUser.name,
      likes: 0, ingredients, steps, videoId, videoAuthor: currentUser.name
    };
    const publications = readStorage('nk-publications', []);
    publications.push(recipe);
    localStorage.setItem('nk-publications', JSON.stringify(publications));
    this.reset();
    bootstrap.Modal.getInstance(document.getElementById('publishModal')).hide();
    renderProfile();
    bootstrap.Tab.getOrCreateInstance(document.getElementById('publicationsTab')).show();
    showNotice('Рецепт опубликован');
  });
  renderProfile();
  updateActionButtons();
}
