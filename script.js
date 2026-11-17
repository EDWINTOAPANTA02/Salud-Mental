/**
 * El Telar del Buen Trato: Tejiendo Salud Mental
 * Lógica interactiva de la cartelera digital UPEC
 */

document.addEventListener('DOMContentLoaded', () => {
  initFullscreenToggle();
  initStepWizard();
  initManilaFolders();
  initMirrorModule();
  initFirstAidKit();
  initInteractiveLoom();
});

/* ==========================================================================
   Modo Pantalla Completa (oculta pestañas y barra del navegador)
   ========================================================================== */
function initFullscreenToggle() {
  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (!btnFullscreen) return;

  function updateButtonLabel() {
    const isFull = Boolean(document.fullscreenElement);
    btnFullscreen.textContent = isFull ? '✕ Salir de Pantalla Completa' : '⛶ Pantalla Completa';
  }

  btnFullscreen.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('No se pudo cambiar a pantalla completa:', error);
      alert('Tu navegador bloqueó el modo pantalla completa. También puedes activarlo presionando la tecla F11.');
    }
  });

  document.addEventListener('fullscreenchange', () => {
    updateButtonLabel();
    window.dispatchEvent(new Event('resize'));
  });
}

/* ==========================================================================
   Navegación por Pasos (Avance obligatorio paso a paso, sin scroll)
   ========================================================================== */
function initStepWizard() {
  const pills = document.querySelectorAll('.step-pill');
  const panels = document.querySelectorAll('.step-panel');
  const nextButtons = document.querySelectorAll('.btn-next');
  const btnFinish = document.getElementById('btn-finalizar');

  function goToStep(stepNumber) {
    const targetStep = String(stepNumber);

    panels.forEach((panel) => {
      const isTarget = panel.dataset.step === targetStep;
      panel.hidden = !isTarget;
      panel.classList.toggle('is-active', isTarget);
    });

    pills.forEach((pill) => {
      const pillStep = Number(pill.dataset.step);
      const current = Number(targetStep);
      const isCurrent = pillStep === current;
      pill.classList.toggle('is-active', isCurrent);
      pill.classList.toggle('is-completed', pillStep < current);
      if (isCurrent) {
        pill.setAttribute('aria-current', 'step');
      } else {
        pill.removeAttribute('aria-current');
      }
    });

    // Si entramos al Paso 4 (El Telar), recalcular tamaño del canvas recién visible
    if (targetStep === '4') {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener('click', () => goToStep(btn.dataset.next));
  });

  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      goToStep(1);
    });
  }
}

/* ==========================================================================
   Módulo 1: "Identifica" (Carpetas Manila desplegables)
   ========================================================================== */
function initManilaFolders() {
  const folderTabs = document.querySelectorAll('.folder-tab');

  folderTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const contentId = tab.getAttribute('aria-controls');
      const contentEl = document.getElementById(contentId);
      const isExpanded = tab.getAttribute('aria-expanded') === 'true';

      tab.setAttribute('aria-expanded', String(!isExpanded));
      contentEl.hidden = isExpanded;
    });
  });
}

/* ==========================================================================
   Módulo 2: "Transforma" (El Espejo con API getUserMedia)
   ========================================================================== */
function initMirrorModule() {
  const btnMirror = document.getElementById('btn-activar-espejo');
  const videoEl = document.getElementById('mirror-video');
  const placeholderEl = document.getElementById('mirror-placeholder');
  let activeStream = null;

  btnMirror.addEventListener('click', async () => {
    // Si la cámara ya está activa, permitir apagarla limpiamente
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
      videoEl.srcObject = null;
      videoEl.classList.remove('is-active');
      placeholderEl.hidden = false;
      btnMirror.textContent = 'Activar Espejo';
      return;
    }

    // Verificar soporte del navegador
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        'Tu navegador no admite el acceso a la cámara web. Prueba abrir esta cartelera en un navegador moderno (Chrome, Edge o Firefox) mediante HTTPS o localhost.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      activeStream = stream;
      videoEl.srcObject = stream;
      videoEl.classList.add('is-active');
      placeholderEl.hidden = true;
      btnMirror.textContent = 'Apagar Espejo';
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert(
        'No pudimos activar el espejo. Por favor, verifica que hayas concedido permiso para usar tu cámara web y que no esté siendo utilizada por otra aplicación.'
      );
    }
  });
}

/* ==========================================================================
   Módulo 3: "Actúa" (Kit de Primeros Auxilios Emocionales)
   ========================================================================== */
function initFirstAidKit() {
  const strategies = [
    'Técnica Mensaje Yo: Expresa tus necesidades sin violencia.',
    'Límites Saludables: Aprende a decir No para proteger tu paz.',
    'Validación Emocional: Escucha sin emitir juicios destructivos.',
  ];

  const btnExtract = document.getElementById('btn-extraer-estrategia');
  const strategySlot = document.getElementById('strategy-slot');
  let lastIndex = -1;

  btnExtract.addEventListener('click', () => {
    // Evita repetir la misma estrategia dos veces seguidas
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * strategies.length);
    } while (randomIndex === lastIndex && strategies.length > 1);

    lastIndex = randomIndex;

    // Reemplaza el contenido con un nuevo nodo para disparar la animación fade-in
    strategySlot.innerHTML = '';
    const card = document.createElement('p');
    card.className = 'strategy-card';
    card.textContent = strategies[randomIndex];
    strategySlot.appendChild(card);
  });
}

/* ==========================================================================
   Zona Inferior: "El Telar Interactivo" (HTML5 Canvas)
   ========================================================================== */
function initInteractiveLoom() {
  const canvas = document.getElementById('telar-canvas');
  const ctx = canvas.getContext('2d');
  const btnReset = document.getElementById('btn-reiniciar-telar');
  const counterEl = document.getElementById('thread-counter');
  const toastEl = document.getElementById('loom-toast');

  const NODE_COUNT = 7;
  const UPEC_GREEN = '#0F5934';
  const UPEC_MUSTARD = '#F2C037';

  // Frases temporales y caritas al tejer un hilo entre dos manos
  const WEAVE_MESSAGES = [
    { emoji: '😊', text: '¡Excelente! Cada hilo fortalece el buen trato en la oficina.' },
    { emoji: '🤗', text: 'La empatía y el respeto nos unen como equipo.' },
    { emoji: '💚', text: '¡Gracias por tejer salud mental y bienestar colectivo!' },
    { emoji: '🌟', text: 'Un pequeño gesto amable transforma el ambiente laboral.' },
    { emoji: '😄', text: 'Juntos construimos espacios libres de violencia psicológica.' },
    { emoji: '🥳', text: '¡Hilo tejido! Tu compromiso suma a la cultura de paz.' },
  ];
  let toastTimeout = null;
  let lastMessageIndex = -1;

  // Paleta de hilos vibrantes para el telar comunitario
  const THREAD_COLORS = [
    '#0F5934',
    '#F2C037',
    '#D94E4E',
    '#2B7A78',
    '#7B4B94',
    '#E07A5F',
    '#2E86AB',
    '#C8553D',
  ];

  let nodes = [];
  let connections = []; // Lista permanente de { from: index, to: index, color: string }
  let selectedNodeIndex = null;

  /**
   * Ajusta la resolución del canvas al tamaño actual y a pantallas HiDPI,
   * recalculando la posición de los 7 nodos en la parte inferior.
   */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    computeNodes(rect.width, rect.height);
    drawLoom();
  }

  /**
   * Calcula las coordenadas horizontales de los 7 nodos estáticos (manos del equipo).
   */
  function computeNodes(width, height) {
    const paddingX = Math.max(40, width * 0.08);
    const usableWidth = width - paddingX * 2;
    const step = usableWidth / (NODE_COUNT - 1);
    const radius = Math.min(26, Math.max(18, width * 0.028));
    const y = height * 0.78;

    nodes = Array.from({ length: NODE_COUNT }, (_, index) => ({
      index,
      x: paddingX + step * index,
      y,
      radius,
    }));
  }

  /**
   * Genera un color aleatorio de la paleta del telar.
   */
  function getRandomThreadColor() {
    return THREAD_COLORS[Math.floor(Math.random() * THREAD_COLORS.length)];
  }

  /**
   * Dibuja todos los hilos permanentes y los 7 nodos sobre el canvas.
   */
  function drawLoom() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // 1. Dibujar hilos permanentes (arcos suaves entre nodos conectados)
    connections.forEach(({ from, to, color }) => {
      const start = nodes[from];
      const end = nodes[to];
      if (!start || !end) return;

      const midX = (start.x + end.x) / 2;
      const distance = Math.abs(end.x - start.x);
      const arcHeight = Math.min(height * 0.62, Math.max(45, distance * 0.34));
      const controlY = start.y - arcHeight;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, controlY, end.x, end.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    });

    // 2. Dibujar los 7 nodos (círculos verdes con emoji ✋)
    nodes.forEach((node) => {
      const isSelected = node.index === selectedNodeIndex;

      ctx.save();

      // Resaltado amarillo mostaza si el nodo está seleccionado
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 192, 55, 0.35)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = UPEC_MUSTARD;
        ctx.stroke();
      }

      // Círculo principal verde UPEC
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = UPEC_GREEN;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSelected ? UPEC_MUSTARD : '#FFFFFF';
      ctx.stroke();

      // Emoji de mano en el centro del nodo
      ctx.font = `${Math.round(node.radius * 1.05)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✋', node.x, node.y + 1);

      ctx.restore();
    });

    counterEl.textContent = `Hilos tejidos: ${connections.length}`;
  }

  /**
   * Detecta si el clic del usuario cayó dentro de alguno de los 7 nodos.
   */
  function findClickedNode(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    return nodes.find((node) => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.hypot(dx, dy) <= node.radius + 6;
    });
  }

  canvas.addEventListener('click', (event) => {
    const clickedNode = findClickedNode(event.clientX, event.clientY);
    if (!clickedNode) return;

    if (selectedNodeIndex === null) {
      // Primer nodo seleccionado: resaltarlo
      selectedNodeIndex = clickedNode.index;
    } else if (selectedNodeIndex === clickedNode.index) {
      // Clic en el mismo nodo: deseleccionar
      selectedNodeIndex = null;
    } else {
      // Segundo nodo seleccionado: trazar hilo permanente de color aleatorio
      connections.push({
        from: selectedNodeIndex,
        to: clickedNode.index,
        color: getRandomThreadColor(),
      });
      selectedNodeIndex = null;
      showWeaveMessage();
    }

    drawLoom();
  });

  /**
   * Muestra una frase motivacional temporal con una carita al tejer un hilo.
   */
  function showWeaveMessage() {
    if (!toastEl) return;

    let msgIndex;
    do {
      msgIndex = Math.floor(Math.random() * WEAVE_MESSAGES.length);
    } while (msgIndex === lastMessageIndex && WEAVE_MESSAGES.length > 1);
    lastMessageIndex = msgIndex;

    const { emoji, text } = WEAVE_MESSAGES[msgIndex];
    toastEl.innerHTML = `<span class="loom-toast-emoji" aria-hidden="true">${emoji}</span><span>${text}</span>`;

    // Reinicia la animación y el temporizador si el usuario teje varios hilos seguidos
    toastEl.hidden = false;
    toastEl.classList.remove('is-visible');
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('is-visible');
      toastEl.hidden = true;
    }, 3200);
  }

  // Botón para reiniciar el telar
  btnReset.addEventListener('click', () => {
    connections = [];
    selectedNodeIndex = null;
    clearTimeout(toastTimeout);
    if (toastEl) {
      toastEl.classList.remove('is-visible');
      toastEl.hidden = true;
    }
    drawLoom();
  });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

