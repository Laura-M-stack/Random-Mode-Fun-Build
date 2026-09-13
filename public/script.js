// script.js — tabs, persona selection, language switch, and API calls

// ---------- i18n ----------
const translations = {
  en: {
    subtitle: 'Three completely useless machines, made with love. Pick one.',
    'tab-excuses': '🎭 Excuse Translator',
    'tab-code-mirror': '💻 Code Mirror',
    'tab-launch-excuse': '🚀 Never-Launch Excuse',
    'h-excuses': 'Excuse Translator',
    'hint-excuses': 'Write your real excuse. Pick who\'s going to "translate" it.',
    'persona-jefe': '😐 Passive-aggressive boss',
    'persona-abuela': '😭 Dramatic grandma',
    'persona-ia': '🤖 Existentialist AI',
    'placeholder-excuses': 'Ex: I was late because I got caught up making mate...',
    'btn-excuses': 'Translate excuse →',
    'h-code-mirror': 'Code Mirror',
    'hint-code-mirror': "Paste a snippet of code. It'll tell you, in first person, how it feels.",
    'btn-code-mirror': 'Ask how it feels →',
    'h-launch-excuse': 'Never-Launch Excuse',
    'hint-launch-excuse': 'Tell it about that project you never publish.',
    'placeholder-launch': "Ex: a habit-tracking app I've been building for 8 months and never shipped",
    'btn-launch-excuse': 'Give me the perfect excuse →',
    footer: 'Made for <strong>Burning Token</strong> · NERDCONF · 2026',
    'empty-input': "Write something first :)",
    'go-thinking': 'Thinking...',
    'generic-error': 'Something went wrong. Try again.',
    'network-error': "Couldn't reach the server. Try again.",
  },
  es: {
    subtitle: 'Tres máquinas completamente inútiles, hechas con cariño. Elegí una.',
    'tab-excuses': '🎭 Traductor de excusas',
    'tab-code-mirror': '💻 Espejo de código',
    'tab-launch-excuse': '🚀 Excusa para no lanzar',
    'h-excuses': 'Traductor de excusas',
    'hint-excuses': 'Escribí tu excusa real. Elegí quién te la va a "traducir".',
    'persona-jefe': '😐 Jefe pasivo-agresivo',
    'persona-abuela': '😭 Abuela dramática',
    'persona-ia': '🤖 IA existencialista',
    'placeholder-excuses': 'Ej: llegué tarde porque se me hizo tarde con el mate...',
    'btn-excuses': 'Traducir excusa →',
    'h-code-mirror': 'Espejo de código',
    'hint-code-mirror': 'Pegá un fragmento de código. Va a decirte, en primera persona, cómo se siente.',
    'btn-code-mirror': 'Preguntarle cómo se siente →',
    'h-launch-excuse': 'Excusa para no lanzar',
    'hint-launch-excuse': 'Contale el nombre o la idea de ese proyecto que nunca publicás.',
    'placeholder-launch': 'Ej: una app de hábitos que hago hace 8 meses y nunca subí a la Play Store',
    'btn-launch-excuse': 'Dame la excusa perfecta →',
    footer: 'Hecho para <strong>Burning Token</strong> · NERDCONF · 2026',
    'empty-input': 'Escribí algo primero :)',
    'go-thinking': 'Pensando...',
    'generic-error': 'Algo salió mal. Probá de nuevo.',
    'network-error': 'No se pudo conectar con el servidor. Probá de nuevo.',
  },
};

let currentLang = localStorage.getItem('randomModeLang') || 'en';

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('randomModeLang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) el.placeholder = translations[lang][key];
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => applyTranslations(btn.dataset.lang));
});

applyTranslations(currentLang);

// ---------- Tabs ----------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.mode-panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    tabs.forEach((t) => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === mode));
  });
});

// ---------- Persona selector (excuses panel only) ----------
let selectedPersona = 'jefe';
document.querySelectorAll('.persona-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.persona-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPersona = btn.dataset.persona;
  });
});

// ---------- API calls ----------
document.querySelectorAll('.go-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.go;
    const textarea = document.querySelector(`textarea[data-input="${mode}"]`);
    const resultBox = document.querySelector(`[data-result="${mode}"]`);
    const input = textarea.value.trim();

    if (!input) {
      showResult(resultBox, translations[currentLang]['empty-input'], true);
      return;
    }

    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.textContent = translations[currentLang]['go-thinking'];
    resultBox.hidden = true;

    try {
      const payload = { mode, input, lang: currentLang };
      if (mode === 'excuses') payload.persona = selectedPersona;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showResult(resultBox, data.error || translations[currentLang]['generic-error'], true);
      } else {
        showResult(resultBox, data.result, false);
      }
    } catch (err) {
      showResult(resultBox, translations[currentLang]['network-error'], true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
});

function showResult(box, text, isError) {
  box.textContent = text;
  box.hidden = false;
  box.classList.toggle('error', isError);
}