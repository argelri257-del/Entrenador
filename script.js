// ============================================================
//  ENTRENADOR LÓGICO-MATEMÁTICO — script.js
// ============================================================

// ---------- Estado global ----------
const state = {
  score: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  totalAnswered: 0,
  difficulty: 'facil',
  category: 'todas',
  answered: false,
  timerInterval: null,
  timeLeft: 0,
  currentQuestion: null,
};

const TIMER = { facil: 30, medio: 20, dificil: 12 };
const POINTS = { facil: 10, medio: 20, dificil: 35 };
const STREAK_BONUS = 5;

// ---------- Generadores de preguntas ----------

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// --- Aritmética ---
function genAritmetica(diff) {
  const ops = diff === 'facil'
    ? ['+', '-']
    : diff === 'medio'
    ? ['+', '-', '×', '÷']
    : ['+', '-', '×', '÷', '²'];

  const op = ops[rnd(0, ops.length - 1)];
  let a, b, answer, text;

  if (op === '+') {
    a = rnd(diff === 'facil' ? 1 : diff === 'medio' ? 10 : 50, diff === 'facil' ? 20 : diff === 'medio' ? 99 : 999);
    b = rnd(diff === 'facil' ? 1 : diff === 'medio' ? 10 : 50, diff === 'facil' ? 20 : diff === 'medio' ? 99 : 999);
    answer = a + b;
    text = `¿Cuánto es ${a} + ${b}?`;
  } else if (op === '-') {
    a = rnd(diff === 'facil' ? 5 : 20, diff === 'facil' ? 30 : diff === 'medio' ? 150 : 500);
    b = rnd(1, a);
    answer = a - b;
    text = `¿Cuánto es ${a} − ${b}?`;
  } else if (op === '×') {
    a = rnd(2, diff === 'medio' ? 12 : 25);
    b = rnd(2, diff === 'medio' ? 12 : 25);
    answer = a * b;
    text = `¿Cuánto es ${a} × ${b}?`;
  } else if (op === '÷') {
    b = rnd(2, diff === 'medio' ? 10 : 15);
    answer = rnd(2, diff === 'medio' ? 12 : 20);
    a = b * answer;
    text = `¿Cuánto es ${a} ÷ ${b}?`;
  } else { // cuadrado
    a = rnd(2, diff === 'dificil' ? 20 : 10);
    answer = a * a;
    text = `¿Cuánto es ${a}²?`;
  }

  const wrongs = generateWrongNumbers(answer, 3, Math.max(2, Math.floor(answer * 0.2)));
  const options = shuffle([answer, ...wrongs]);

  return {
    text,
    options: options.map(String),
    answer: String(answer),
    explanation: `La respuesta correcta es ${answer}. Operación: ${text.replace('¿Cuánto es ', '').replace('?', '')} = ${answer}`,
    category: 'aritmetica',
    difficulty: diff,
  };
}

function generateWrongNumbers(correct, count, spread) {
  const wrongs = new Set();
  const min = Math.max(0, correct - spread);
  const max = correct + spread;
  let tries = 0;
  while (wrongs.size < count && tries < 100) {
    const n = rnd(min, max);
    if (n !== correct) wrongs.add(n);
    tries++;
  }
  // Fallback si no hay suficientes
  let i = 1;
  while (wrongs.size < count) {
    if (correct + i !== correct) wrongs.add(correct + i);
    if (wrongs.size < count && correct - i > 0) wrongs.add(correct - i);
    i++;
  }
  return [...wrongs].slice(0, count);
}

// --- Secuencias ---
function genSecuencias(diff) {
  const types = diff === 'facil'
    ? ['aritmetica']
    : diff === 'medio'
    ? ['aritmetica', 'geometrica', 'cuadrados']
    : ['aritmetica', 'geometrica', 'cuadrados', 'fibonacci', 'alternada'];

  const type = types[rnd(0, types.length - 1)];
  let seq = [], answer, text, explanation;

  if (type === 'aritmetica') {
    const start = rnd(1, diff === 'facil' ? 10 : 50);
    const step = rnd(diff === 'facil' ? 1 : 2, diff === 'facil' ? 5 : diff === 'medio' ? 15 : 30);
    seq = [start, start + step, start + 2 * step, start + 3 * step];
    answer = start + 4 * step;
    explanation = `Es una secuencia aritmética con diferencia +${step}. El siguiente término es ${seq[3]} + ${step} = ${answer}.`;
  } else if (type === 'geometrica') {
    const start = rnd(1, 5);
    const ratio = rnd(2, diff === 'medio' ? 3 : 5);
    seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
    answer = start * ratio ** 4;
    explanation = `Es una secuencia geométrica con razón ×${ratio}. El siguiente término es ${seq[3]} × ${ratio} = ${answer}.`;
  } else if (type === 'cuadrados') {
    const start = rnd(1, 5);
    seq = [start ** 2, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
    answer = (start + 4) ** 2;
    explanation = `Son los cuadrados de ${start}, ${start+1}, ${start+2}, ${start+3}... El siguiente es ${start+4}² = ${answer}.`;
  } else if (type === 'fibonacci') {
    const a = rnd(1, 8), b = rnd(1, 8);
    seq = [a, b, a + b, a + 2 * b];
    answer = 2 * a + 3 * b;
    explanation = `Cada término es la suma de los dos anteriores. ${seq[2]} + ${seq[3]} = ${answer}.`;
  } else { // alternada
    const step1 = rnd(2, 8), step2 = rnd(1, 5);
    const start = rnd(5, 20);
    seq = [start, start + step1, start + step1 - step2, start + 2 * step1 - step2];
    answer = start + 2 * step1 - 2 * step2;
    explanation = `La secuencia alterna +${step1} y −${step2}. Aplicando −${step2}: ${seq[3]} − ${step2} = ${answer}.`;
  }

  const hiddenIdx = 4; // siempre ocultamos el 5to elemento
  text = `Completa la secuencia: ${seq.join(', ')}, __?`;

  const wrongs = generateWrongNumbers(answer, 3, Math.max(3, Math.floor(answer * 0.25)));
  const options = shuffle([answer, ...wrongs]);

  return {
    text,
    options: options.map(String),
    answer: String(answer),
    explanation,
    category: 'secuencias',
    difficulty: diff,
  };
}

// --- Lógica ---
function genLogica(diff) {
  const templates = [
    // Silogismos simples
    () => {
      const animales = [['perros', 'mamíferos'], ['gatos', 'felinos'], ['águilas', 'aves'], ['ballenas', 'cetáceos']];
      const [animal, clase] = animales[rnd(0, animales.length - 1)];
      const nombre = ['Firulais', 'Michi', 'Águeda', 'Nemo'][rnd(0, 3)];
      return {
        text: `Todos los ${animal} son ${clase}. ${nombre} es un ${animal.slice(0, -1)}. Por lo tanto, ¿${nombre} es un ${clase.slice(0, -1)}?`,
        options: ['Sí, siempre', 'No, nunca', 'A veces', 'No se puede saber'],
        answer: 'Sí, siempre',
        explanation: `Por la regla del silogismo: si todos los ${animal} son ${clase} y ${nombre} es un ${animal.slice(0, -1)}, entonces ${nombre} es necesariamente un ${clase.slice(0, -1)}.`,
      };
    },
    // Proposiciones
    () => {
      const a = rnd(1, 9), b = rnd(1, 9);
      const sum = a + b;
      return {
        text: `Si A = ${a} y B = ${b}, ¿cuál afirmación es verdadera?`,
        options: shuffle([
          `A + B = ${sum}`,
          `A + B = ${sum + 1}`,
          `A × B = ${a * b + 2}`,
          `A − B = ${Math.abs(a - b) + 1}`,
        ]),
        answer: `A + B = ${sum}`,
        explanation: `${a} + ${b} = ${sum}. Las demás opciones tienen valores incorrectos.`,
      };
    },
    // Negación
    () => {
      const n = rnd(2, 9);
      return {
        text: `"Todos los números mayores que ${n} son impares." ¿Qué ejemplo refuta esta afirmación?`,
        options: shuffle([
          `${n + 2} (par)`,
          `${n + 1} (impar)`,
          `${n - 1} (menor)`,
          `${n} (igual)`,
        ]),
        answer: `${n + 2} (par)`,
        explanation: `${n + 2} es mayor que ${n} y es par, por lo que contradice la afirmación.`,
      };
    },
    // Condicionales
    () => {
      return {
        text: `Si "llueve → el suelo se moja" y "el suelo no está mojado", ¿qué podemos concluir?`,
        options: ['No llovió', 'Sí llovió', 'No se puede saber', 'Está lloviendo ahora'],
        answer: 'No llovió',
        explanation: `Por Modus Tollens: si P→Q y ¬Q, entonces ¬P. El suelo seco implica que no llovió.`,
      };
    },
  ];

  // En dificultad alta, añadir más plantillas complejas
  const extraHard = [
    () => {
      const x = rnd(2, 6);
      return {
        text: `En una fila, Ana está en la posición ${x}. Hay ${x - 1} personas delante de ella y ${rnd(x, x + 4)} detrás. ¿Cuántas personas hay en total en la fila?`,
        options: (() => {
          const behind = rnd(x, x + 4);
          const total = x + behind;
          return shuffle([String(total), String(total + 1), String(total - 1), String(total + 2)]);
        })(),
        answer: (() => { const behind = rnd(x, x + 4); return String(x + behind); })(),
        explanation: `Ana ocupa la posición ${x}, hay ${x-1} delante y el resto detrás. Total = posición + personas detrás.`,
      };
    },
  ];

  const pool = diff === 'dificil' ? [...templates, ...extraHard] : templates;
  const gen = pool[rnd(0, pool.length - 1)];
  const q = gen();

  return {
    ...q,
    category: 'logica',
    difficulty: diff,
  };
}

// --- Geometría ---
function genGeometria(diff) {
  const shapes = diff === 'facil'
    ? ['cuadrado', 'rectangulo', 'triangulo']
    : diff === 'medio'
    ? ['cuadrado', 'rectangulo', 'triangulo', 'circulo', 'trapecio']
    : ['cuadrado', 'rectangulo', 'triangulo', 'circulo', 'trapecio', 'rombo', 'paralelogramo'];

  const shape = shapes[rnd(0, shapes.length - 1)];
  let text, answer, explanation;

  const PI = Math.PI;
  const fmt = n => Number.isInteger(n) ? String(n) : n.toFixed(2);

  if (shape === 'cuadrado') {
    const l = rnd(2, diff === 'facil' ? 10 : 20);
    const type = rnd(0, 1) === 0 ? 'area' : 'perimetro';
    answer = type === 'area' ? l * l : 4 * l;
    text = `Un cuadrado tiene lado ${l}. ¿Cuál es su ${type === 'area' ? 'área' : 'perímetro'}?`;
    explanation = type === 'area'
      ? `Área del cuadrado = lado² = ${l}² = ${answer}`
      : `Perímetro del cuadrado = 4 × lado = 4 × ${l} = ${answer}`;
  } else if (shape === 'rectangulo') {
    const w = rnd(2, 15), h = rnd(2, 15);
    const type = rnd(0, 1) === 0 ? 'area' : 'perimetro';
    answer = type === 'area' ? w * h : 2 * (w + h);
    text = `Un rectángulo mide ${w} × ${h}. ¿Cuál es su ${type === 'area' ? 'área' : 'perímetro'}?`;
    explanation = type === 'area'
      ? `Área = base × altura = ${w} × ${h} = ${answer}`
      : `Perímetro = 2(base + altura) = 2(${w} + ${h}) = ${answer}`;
  } else if (shape === 'triangulo') {
    const b = rnd(3, 15), h = rnd(3, 15);
    answer = (b * h) / 2;
    text = `Un triángulo tiene base ${b} y altura ${h}. ¿Cuál es su área?`;
    explanation = `Área = (base × altura) / 2 = (${b} × ${h}) / 2 = ${answer}`;
  } else if (shape === 'circulo') {
    const r = rnd(1, 10);
    const type = rnd(0, 1) === 0 ? 'area' : 'circunferencia';
    const rawAnswer = type === 'area' ? PI * r * r : 2 * PI * r;
    answer = parseFloat(rawAnswer.toFixed(2));
    text = `Un círculo tiene radio ${r}. ¿Cuál es su ${type === 'area' ? 'área' : 'circunferencia'} (aproximada, π≈3.14)?`;
    const pi = 3.14;
    explanation = type === 'area'
      ? `Área = π × r² ≈ 3.14 × ${r}² = 3.14 × ${r*r} ≈ ${answer}`
      : `Circunferencia = 2π × r ≈ 2 × 3.14 × ${r} ≈ ${answer}`;
    answer = parseFloat((type === 'area' ? 3.14 * r * r : 2 * 3.14 * r).toFixed(2));
  } else if (shape === 'trapecio') {
    const a = rnd(3, 12), b = rnd(3, 12), h = rnd(2, 10);
    answer = ((a + b) * h) / 2;
    text = `Un trapecio tiene bases ${a} y ${b}, y altura ${h}. ¿Cuál es su área?`;
    explanation = `Área = (base mayor + base menor) × altura / 2 = (${a} + ${b}) × ${h} / 2 = ${answer}`;
  } else if (shape === 'rombo') {
    const d1 = rnd(4, 16), d2 = rnd(4, 16);
    answer = (d1 * d2) / 2;
    text = `Un rombo tiene diagonales ${d1} y ${d2}. ¿Cuál es su área?`;
    explanation = `Área = (diagonal₁ × diagonal₂) / 2 = (${d1} × ${d2}) / 2 = ${answer}`;
  } else { // paralelogramo
    const b = rnd(3, 15), h = rnd(3, 15);
    answer = b * h;
    text = `Un paralelogramo tiene base ${b} y altura ${h}. ¿Cuál es su área?`;
    explanation = `Área = base × altura = ${b} × ${h} = ${answer}`;
  }

  const spread = Math.max(2, Math.floor(Number(answer) * 0.3));
  const wrongs = generateWrongNumbers(Number(answer), 3, spread).map(n => fmt(n));
  const options = shuffle([fmt(answer), ...wrongs]);

  return {
    text,
    options,
    answer: fmt(answer),
    explanation,
    category: 'geometria',
    difficulty: diff,
  };
}

// --- Problemas ---
function genProblemas(diff) {
  const templates = [
    // Problemas de velocidad
    () => {
      const v = rnd(40, 120);
      const t = rnd(1, 5);
      const d = v * t;
      return {
        text: `Un tren viaja a ${v} km/h durante ${t} hora${t > 1 ? 's' : ''}. ¿Qué distancia recorre?`,
        answer: d,
        explanation: `Distancia = velocidad × tiempo = ${v} × ${t} = ${d} km`,
      };
    },
    // Problemas de porcentaje
    () => {
      const total = rnd(2, 10) * 10;
      const pct = [10, 20, 25, 50][rnd(0, 3)];
      const result = (total * pct) / 100;
      return {
        text: `En una tienda, un artículo de $${total} tiene un ${pct}% de descuento. ¿Cuánto se descuenta?`,
        answer: result,
        explanation: `Descuento = ${pct}% de ${total} = ${total} × ${pct}/100 = $${result}`,
      };
    },
    // Problemas de edades
    () => {
      const age = rnd(8, 40);
      const diff_age = rnd(2, 15);
      return {
        text: `María tiene ${age} años y su hermano es ${diff_age} años menor. ¿Cuántos años tiene el hermano?`,
        answer: age - diff_age,
        explanation: `Edad del hermano = ${age} − ${diff_age} = ${age - diff_age} años`,
      };
    },
    // Problemas de dinero
    () => {
      const price = rnd(5, 50);
      const qty = rnd(2, 8);
      const total = price * qty;
      return {
        text: `Si ${qty} libros cuestan $${price} cada uno, ¿cuánto cuestan en total?`,
        answer: total,
        explanation: `Total = precio × cantidad = $${price} × ${qty} = $${total}`,
      };
    },
    // Problemas de mezcla (nivel medio/difícil)
    () => {
      const total = rnd(20, 100);
      const part = rnd(5, total - 5);
      const rest = total - part;
      return {
        text: `En un grupo de ${total} estudiantes, ${part} son mujeres. ¿Cuántos son hombres?`,
        answer: rest,
        explanation: `Hombres = total − mujeres = ${total} − ${part} = ${rest}`,
      };
    },
    // Problema de tiempo (medio/difícil)
    () => {
      const horasMin = rnd(1, 4);
      const minutos = rnd(10, 55);
      const totalMin = horasMin * 60 + minutos;
      const extraMin = rnd(15, 90);
      const newTotal = totalMin + extraMin;
      const newH = Math.floor(newTotal / 60);
      const newM = newTotal % 60;
      return {
        text: `Una película dura ${horasMin}h ${minutos}min. Si empieza ${extraMin} minutos antes de lo planeado, ¿cuánto dura en total desde el inicio adelantado hasta el final?`,
        answer: `${newH}h ${newM}min`,
        explanation: `Duración original: ${horasMin}×60 + ${minutos} = ${totalMin} min. Sumando ${extraMin} min = ${newTotal} min = ${newH}h ${newM}min.`,
        isText: true,
      };
    },
  ];

  const pool = diff === 'facil'
    ? templates.slice(0, 3)
    : diff === 'medio'
    ? templates.slice(0, 5)
    : templates;

  const gen = pool[rnd(0, pool.length - 1)];
  const q = gen();

  let options, answer;

  if (q.isText) {
    answer = q.answer;
    // Generar opciones de tiempo incorrectas
    const parts = answer.match(/(\d+)h (\d+)min/);
    if (parts) {
      const h = parseInt(parts[1]), m = parseInt(parts[2]);
      const alts = [
        `${h}h ${m + 10}min`,
        `${h + 1}h ${m}min`,
        `${h - 1 >= 0 ? h - 1 : h + 2}h ${m + 5}min`,
      ];
      options = shuffle([answer, ...alts]);
    } else {
      options = [answer, 'Otra', 'Ninguna', 'No se puede'];
    }
  } else {
    answer = String(q.answer);
    const wrongs = generateWrongNumbers(Number(q.answer), 3, Math.max(3, Math.floor(Number(q.answer) * 0.3)));
    options = shuffle([answer, ...wrongs.map(String)]);
  }

  return {
    text: q.text,
    options,
    answer: String(answer),
    explanation: q.explanation,
    category: 'problemas',
    difficulty: diff,
  };
}

// ---------- Dispatcher ----------
function generateQuestion() {
  const cats = ['aritmetica', 'secuencias', 'logica', 'geometria', 'problemas'];
  const cat = state.category === 'todas'
    ? cats[rnd(0, cats.length - 1)]
    : state.category;

  switch (cat) {
    case 'aritmetica':  return genAritmetica(state.difficulty);
    case 'secuencias':  return genSecuencias(state.difficulty);
    case 'logica':      return genLogica(state.difficulty);
    case 'geometria':   return genGeometria(state.difficulty);
    case 'problemas':   return genProblemas(state.difficulty);
    default:            return genAritmetica(state.difficulty);
  }
}

// ---------- UI ----------
function renderQuestion(q) {
  state.currentQuestion = q;
  state.answered = false;

  const diffTag = { facil: 'tag-facil', medio: 'tag-medio', dificil: 'tag-dificil' }[q.difficulty];
  const diffLabel = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' }[q.difficulty];
  const catLabel = { aritmetica: '🔢 Aritmética', secuencias: '🔄 Secuencias', logica: '🧠 Lógica', geometria: '📐 Geometría', problemas: '📝 Problemas' }[q.category];

  const labels = ['A', 'B', 'C', 'D'];
  const optionsHTML = q.options.map((opt, i) => `
    <button class="option-btn" data-idx="${i}" data-value="${opt}">
      <span class="opt-label">${labels[i]}</span>
      ${opt}
    </button>
  `).join('');

  document.getElementById('question-content').innerHTML = `
    <div class="q-meta">
      <span class="q-num">#${state.totalAnswered + 1}</span>
      <span class="q-tag ${diffTag}">${diffLabel}</span>
      <span class="q-tag" style="background:rgba(255,255,255,0.05);color:var(--muted);border:1px solid var(--border)">${catLabel}</span>
      <span class="timer-badge" id="timer-display">⏱ ${TIMER[q.difficulty]}s</span>
    </div>
    <div class="question-text">${q.text}</div>
    <div class="options-grid" id="options-grid">
      ${optionsHTML}
    </div>
    <div class="explanation-box" id="explanation-box">
      <div class="exp-title">✦ Explicación</div>
      <div>${q.explanation}</div>
    </div>
  `;

  // Eventos de opciones
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.value));
  });

  document.getElementById('btn-next').disabled = true;
  startTimer(q.difficulty);
}

function handleAnswer(selected) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerInterval);

  const q = state.currentQuestion;
  const isCorrect = selected === q.answer;

  state.totalAnswered++;

  if (isCorrect) {
    state.correct++;
    state.streak++;
    const pts = POINTS[q.difficulty] + (state.streak > 2 ? STREAK_BONUS * (state.streak - 2) : 0);
    state.score += pts;
  } else {
    state.wrong++;
    state.streak = 0;
  }

  // Colorear opciones
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === q.answer) {
      btn.classList.add('correct');
    } else if (btn.dataset.value === selected && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Mostrar explicación
  document.getElementById('explanation-box').classList.add('show');

  // Actualizar stats
  updateStats();

  // Habilitar siguiente
  document.getElementById('btn-next').disabled = false;
}

function startTimer(diff) {
  state.timeLeft = TIMER[diff];
  const display = document.getElementById('timer-display');
  clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    if (display) {
      display.textContent = `⏱ ${state.timeLeft}s`;
      if (state.timeLeft <= 5) display.classList.add('warning');
      else display.classList.remove('warning');
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      if (!state.answered) {
        state.answered = true;
        state.wrong++;
        state.streak = 0;
        state.totalAnswered++;
        // Marcar respuesta correcta
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.disabled = true;
          if (btn.dataset.value === state.currentQuestion.answer) btn.classList.add('correct');
        });
        document.getElementById('explanation-box').classList.add('show');
        document.getElementById('btn-next').disabled = false;
        updateStats();
      }
    }
  }, 1000);
}

function updateStats() {
  document.getElementById('stat-score').textContent = state.score;
  document.getElementById('stat-correct').textContent = state.correct;
  document.getElementById('stat-wrong').textContent = state.wrong;
  document.getElementById('stat-streak').textContent = state.streak;

  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

function loadNewQuestion() {
  const content = document.getElementById('question-content');
  content.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">Generando pregunta<span class="loading-dots"></span></div>
    </div>
  `;
  document.getElementById('btn-next').disabled = true;

  setTimeout(() => {
    const q = generateQuestion();
    renderQuestion(q);
  }, 400);
}

// ---------- Inicialización y eventos ----------
document.addEventListener('DOMContentLoaded', () => {
  // Dificultad
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.diff;
      loadNewQuestion();
    });
  });

  // Categorías
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.cat;
      loadNewQuestion();
    });
  });

  // Siguiente
  document.getElementById('btn-next').addEventListener('click', loadNewQuestion);

  // Saltar
  document.getElementById('btn-skip').addEventListener('click', () => {
    clearInterval(state.timerInterval);
    loadNewQuestion();
  });

  // Primera pregunta
  loadNewQuestion();
});
