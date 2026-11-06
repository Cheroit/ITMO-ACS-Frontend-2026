const themeKey = 'na-kuhne-theme';
const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');

function readTheme() {
  try {
    const saved = localStorage.getItem(themeKey);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
  }
  return 'auto';
}

let themeChoice = readTheme();

function applyTheme() {
  const systemTheme = darkPreference.matches ? 'dark' : 'light';
  document.documentElement.dataset.bsTheme = themeChoice === 'auto' ? systemTheme : themeChoice;
}

applyTheme();
darkPreference.addEventListener('change', applyTheme);

document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('themeSelect');
  picker.value = themeChoice;
  picker.addEventListener('change', () => {
    themeChoice = picker.value;
    applyTheme();
    try {
      localStorage.setItem(themeKey, themeChoice);
    } catch {
    }
  });
});
