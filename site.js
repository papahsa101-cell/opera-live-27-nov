const buttons = [...document.querySelectorAll('button[data-theme]')];

function applyTheme(theme) {
  const active = buttons.find(button => button.dataset.theme === theme) ?? buttons[0];
  document.documentElement.dataset.theme = active.dataset.theme;
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button === active));
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('style', button.dataset.theme);
    try { history.replaceState(null, '', url); } catch {}
    applyTheme(button.dataset.theme);
  });
}
applyTheme(new URL(location.href).searchParams.get('style'));

