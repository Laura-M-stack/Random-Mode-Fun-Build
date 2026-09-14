// script.js — tabs, persona selection, language switch, examples, copy, and API calls

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
    credit: 'by <a href="https://www.linkedin.com/in/laura-moyano-h/" target="_blank" rel="noopener noreferrer">Laura Moyano</a>',
    'empty-input': 'Write something first :)',
    'generic-error': 'Something went wrong. Try again.',
    'network-error': "Couldn't reach the server. Try again.",
    'example-btn': '✨ Try an example',
    'kbd-hint': 'Enter to submit · Shift+Enter for a new line',
    'copy-btn': '📋 Copy',
    'copied-btn': '✅ Copied!',
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
    credit: 'por <a href="https://www.linkedin.com/in/laura-moyano-h/" target="_blank" rel="noopener noreferrer">Laura Moyano</a>',
    'empty-input': 'Escribí algo primero :)',
    'generic-error': 'Algo salió mal. Probá de nuevo.',
    'network-error': 'No se pudo conectar con el servidor. Probá de nuevo.',
    'example-btn': '✨ Probar un ejemplo',
    'kbd-hint': 'Enter para enviar · Shift+Enter para salto de línea',
    'copy-btn': '📋 Copiar',
    'copied-btn': '✅ ¡Copiado!',
  },
};

// ---------- Example inputs per mode/language ----------
const examples = {
  excuses: {
    en: [
      "I missed the meeting because my cat unplugged my laptop mid-presentation.",
      "I was late because I got stuck behind a parade I didn't know existed.",
      "I forgot to reply to your email because my inbox achieved sentience and is on strike.",
      "I skipped the gym because my shoes felt personally attacked by the treadmill.",
    ],
    es: [
      "Falté a la reunión porque mi gato desenchufó la notebook en medio de la presentación.",
      "Llegué tarde porque me quedé atrapada detrás de un desfile que no sabía que existía.",
      "No te contesté el mensaje porque mi bandeja de entrada cobró conciencia propia y está en huelga.",
      "No fui al gimnasio porque mis zapatillas se sintieron atacadas personalmente por la cinta.",
    ],
  },
  'code-mirror': {
    en: [
      "function totallyFine(arr) {\n  for (var i = 0; i < arr.length; i++) {\n    for (var j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j] && i !== j) console.log('dup');\n    }\n  }\n}",
      "let data;\ntry {\n  data = JSON.parse(response);\n} catch (e) {\n  // ignore\n}",
      "const isEven = (n) => n % 2 == 0 ? true : n % 2 != 0 ? false : null;",
    ],
    es: [
      "function totallyFine(arr) {\n  for (var i = 0; i < arr.length; i++) {\n    for (var j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j] && i !== j) console.log('dup');\n    }\n  }\n}",
      "let data;\ntry {\n  data = JSON.parse(response);\n} catch (e) {\n  // ignore\n}",
      "const isEven = (n) => n % 2 == 0 ? true : n % 2 != 0 ? false : null;",
    ],
  },
  'launch-excuse': {
    en: [
      "A habit-tracking app I've been building for 8 months and never shipped.",
      "A newsletter I've been meaning to start since January.",
      "A portfolio redesign that's been \"almost done\" for a year.",
      "A game prototype sitting in a folder called final_final_v3.",
    ],
    es: [
      "Una app de hábitos que hago hace 8 meses y nunca subí a la tienda.",
      "Un newsletter que vengo posponiendo desde enero.",
      "Un rediseño de mi portfolio que está \"casi listo\" hace un año.",
      "Un prototipo de juego guardado en una carpeta llamada final_final_v3.",
    ],
  },
};

// Avoid repeating the same example twice in a row per mode.
const lastExampleIndex = {};

function pickExample(mode, lang) {
  const list = examples[mode][lang] || examples[mode].en;
  if (list.length === 1) return list[0];
  let index;
  do {
    index = Math.floor(Math.random() * list.length);
  } while (index === lastExampleIndex[mode]);
  lastExampleIndex[mode] = index;
  return list[index];
}

// ---------- Playful "thinking" messages ----------
const thinkingMessages = {
  excuses: {
    en: { jefe: 'Consulting the boss...', abuela: 'Summoning grandma...', ia: 'Questioning existence...' },
    es: { jefe: 'Consultando al jefe...', abuela: 'Invocando a la abuela...', ia: 'Cuestionando la existencia...' },
  },
  'code-mirror': {
    en: ["Reading the code's diary...", "Checking its feelings...", "Opening old wounds..."],
    es: ['Leyendo el diario del código...', 'Revisando sus sentimientos...', 'Reabriendo heridas viejas...'],
  },
  'launch-excuse': {
    en: ['Inventing a good excuse...', 'Building rationalizations...', 'Negotiating with procrastination...'],
    es: ['Inventando una buena excusa...', 'Construyendo justificaciones...', 'Negociando con la procrastinación...'],
  },
};

function getThinkingMessage(mode, lang, persona) {
  const entry = thinkingMessages[mode][lang];
  if (mode === 'excuses') return entry[persona] || entry.jefe;
  return entry[Math.floor(Math.random() * entry.length)];
}

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

// ---------- Example buttons ----------
document.querySelectorAll('.example-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.example;
    const textarea = document.querySelector(`textarea[data-input="${mode}"]`);
    textarea.value = pickExample(mode, currentLang);
    textarea.focus();
  });
});

// ---------- Enter to submit, Shift+Enter for a new line ----------
document.querySelectorAll('textarea[data-input]').forEach((textarea) => {
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const mode = textarea.dataset.input;
      document.querySelector(`.go-btn[data-go="${mode}"]`).click();
    }
    // Shift+Enter: no preventDefault, so the browser inserts the newline as usual.
  });
});

// ---------- Copy to clipboard ----------
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const resultBox = btn.closest('.result');
    const text = resultBox.querySelector('[data-result-text]').textContent;
    try {
      await navigator.clipboard.writeText(text);
      const span = btn.querySelector('span');
      const original = span.textContent;
      span.textContent = translations[currentLang]['copied-btn'];
      setTimeout(() => { span.textContent = original; }, 1500);
    } catch (err) {
      // Clipboard API unavailable or blocked — fail silently, not critical.
    }
  });
});

// ---------- API calls ----------
document.querySelectorAll('.go-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.go;
    const textarea = document.querySelector(`textarea[data-input="${mode}"]`);
    const resultBox = document.querySelector(`[data-result="${mode}"]`);
    const resultText = resultBox.querySelector('[data-result-text]');
    const input = textarea.value.trim();

    if (!input) {
      showResult(resultBox, resultText, translations[currentLang]['empty-input'], true);
      return;
    }

    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.textContent = getThinkingMessage(mode, currentLang, selectedPersona);
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
        showResult(resultBox, resultText, data.error || translations[currentLang]['generic-error'], true);
      } else {
        showResult(resultBox, resultText, data.result, false);
      }
    } catch (err) {
      showResult(resultBox, resultText, translations[currentLang]['network-error'], true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
});

function showResult(box, textEl, text, isError) {
  textEl.textContent = text;
  box.hidden = false;
  box.classList.remove('error'); // reset to restart the reveal animation
  box.classList.toggle('error', isError);
  // restart CSS animation even if the box was already visible
  box.style.animation = 'none';
  void box.offsetWidth;
  box.style.animation = '';
}