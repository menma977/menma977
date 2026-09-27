const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotionEnabled = () => reducedMotionMediaQuery.matches;

function initNavigation() {
  const navigationToggleButton = document.querySelector('.nav-toggle');
  const navigationElement = document.querySelector('nav');

  if (!navigationToggleButton || !navigationElement) return;

  navigationToggleButton.addEventListener('click', () => {
    navigationToggleButton.classList.toggle('active');
    navigationElement.classList.toggle('open');
    navigationToggleButton.setAttribute('aria-expanded', navigationElement.classList.contains('open'));
  });

  navigationElement.querySelectorAll('a').forEach(navigationLinkElement => {
    navigationLinkElement.addEventListener('click', () => {
      navigationToggleButton.classList.remove('active');
      navigationElement.classList.remove('open');
      navigationToggleButton.setAttribute('aria-expanded', 'false');
    });
  });
}

initNavigation();

const heroQuoteItems = document.querySelectorAll('.hero-quote-item');
let currentQuoteIndex = 0;
let quoteRotationInterval = null;

if (heroQuoteItems.length > 1 && !reducedMotionEnabled()) {
  quoteRotationInterval = setInterval(() => {
    heroQuoteItems[currentQuoteIndex].classList.remove('active');
    currentQuoteIndex = (currentQuoteIndex + 1) % heroQuoteItems.length;
    heroQuoteItems[currentQuoteIndex].classList.add('active');
  }, 3000);
}

const heroTitleElement = document.querySelector('.hero-title');
if (heroTitleElement && !reducedMotionEnabled()) {
  setTimeout(() => {
    heroTitleElement.classList.add('glitch-active');
    setTimeout(() => {
      heroTitleElement.classList.remove('glitch-active');
    }, 300);
  }, 1500);
}

const scrollAnimationObserver = new IntersectionObserver((animationObserverEntries, animationObserver) => {
  animationObserverEntries.forEach(animationObserverEntry => {
    if (animationObserverEntry.isIntersecting) {
      animationObserverEntry.target.classList.add('visible');
      animationObserver.unobserve(animationObserverEntry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.fade-in').forEach(animationTargetElement => {
  scrollAnimationObserver.observe(animationTargetElement);
});

const currentYearElement = document.getElementById('current-year');
if (currentYearElement) {
  currentYearElement.textContent = new Date().getFullYear();
}

(function initCableAnimation() {
  const cableCanvas = document.getElementById('cable-canvas');
  if (!cableCanvas || !cableCanvas.getContext) return;
  if (reducedMotionEnabled()) return;

  const cableCanvasContext = cableCanvas.getContext('2d');
  if (!cableCanvasContext) return;

  const gridCellSize = 20;
  const maxTrailLength = 400;
  const cableSpeed = 3.5;
  const cableColors = ['#00E5FF', '#FF00FF', '#FCEE0A'];
  const maxActiveCables = 4;
  const minActiveCables = 2;
  const spawnIntervalMin = 5000;
  const spawnIntervalMax = 8000;

  let activeCables = [];
  let lastSpawnTime = 0;
  let nextSpawnDelay = spawnIntervalMin + Math.random() * (spawnIntervalMax - spawnIntervalMin);
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  function resizeCableCanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    cableCanvas.width = viewportWidth * devicePixelRatio;
    cableCanvas.height = viewportHeight * devicePixelRatio;
    cableCanvas.style.width = viewportWidth + 'px';
    cableCanvas.style.height = viewportHeight + 'px';
    cableCanvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  resizeCableCanvas();
  window.addEventListener('resize', resizeCableCanvas);

  function createCableSnake() {
    const directionChoice = Math.random() < 0.5 ? 'right' : 'down';
    let startX, startY, directionX, directionY;

    if (directionChoice === 'right') {
      startX = 0;
      startY = Math.floor(Math.random() * (viewportHeight / gridCellSize)) * gridCellSize;
      directionX = 1;
      directionY = 0;
    } else {
      startX = Math.floor(Math.random() * (viewportWidth / gridCellSize)) * gridCellSize;
      startY = 0;
      directionX = 0;
      directionY = 1;
    }

    return {
      trail: [{ x: startX, y: startY }],
      headX: startX,
      headY: startY,
      directionX: directionX,
      directionY: directionY,
      color: cableColors[Math.floor(Math.random() * cableColors.length)],
      speed: cableSpeed,
      alive: true,
      goalDirection: directionChoice,
      distanceSinceLastTurn: 0,
      minDistanceBeforeTurn: gridCellSize * (2 + Math.floor(Math.random() * 4))
    };
  }

  function updateCableSnake(cableSnake) {
    if (!cableSnake.alive) return;

    cableSnake.distanceSinceLastTurn += cableSnake.speed;

    const currentGridX = Math.round(cableSnake.headX / gridCellSize) * gridCellSize;
    const currentGridY = Math.round(cableSnake.headY / gridCellSize) * gridCellSize;
    const distanceToGrid = Math.abs(cableSnake.headX - currentGridX) + Math.abs(cableSnake.headY - currentGridY);

    if (distanceToGrid < cableSnake.speed && cableSnake.distanceSinceLastTurn >= cableSnake.minDistanceBeforeTurn) {
      const canGoRight = cableSnake.headX + gridCellSize < viewportWidth;
      const canGoDown = cableSnake.headY + gridCellSize < viewportHeight;
      const canGoLeft = cableSnake.headX - gridCellSize >= 0;
      const canGoUp = cableSnake.headY - gridCellSize >= 0;

      const possibleDirections = [];

      if (cableSnake.directionX !== -1 && canGoRight) possibleDirections.push({ x: 1, y: 0 });
      if (cableSnake.directionX !== 1 && canGoLeft) possibleDirections.push({ x: -1, y: 0 });
      if (cableSnake.directionY !== -1 && canGoDown) possibleDirections.push({ x: 0, y: 1 });
      if (cableSnake.directionY !== 1 && canGoUp) possibleDirections.push({ x: 0, y: -1 });

      if (possibleDirections.length > 0) {
        const continueStraight = possibleDirections.find(candidateDirection => candidateDirection.x === cableSnake.directionX && candidateDirection.y === cableSnake.directionY);

        if (continueStraight && Math.random() < 0.6) {
          cableSnake.directionX = continueStraight.x;
          cableSnake.directionY = continueStraight.y;
        } else {
          const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          cableSnake.directionX = randomDirection.x;
          cableSnake.directionY = randomDirection.y;
        }

        cableSnake.distanceSinceLastTurn = 0;
        cableSnake.minDistanceBeforeTurn = gridCellSize * (2 + Math.floor(Math.random() * 4));

        cableSnake.headX = currentGridX;
        cableSnake.headY = currentGridY;
      }
    }

    cableSnake.headX += cableSnake.directionX * cableSnake.speed;
    cableSnake.headY += cableSnake.directionY * cableSnake.speed;

    cableSnake.trail.push({ x: cableSnake.headX, y: cableSnake.headY });

    let totalTrailDistance = 0;
    for (let trailIndex = cableSnake.trail.length - 1; trailIndex > 0; trailIndex--) {
      const segmentDeltaX = cableSnake.trail[trailIndex].x - cableSnake.trail[trailIndex - 1].x;
      const segmentDeltaY = cableSnake.trail[trailIndex].y - cableSnake.trail[trailIndex - 1].y;
      const segmentDistance = Math.sqrt(segmentDeltaX * segmentDeltaX + segmentDeltaY * segmentDeltaY);
      totalTrailDistance += segmentDistance;
      if (totalTrailDistance > maxTrailLength) {
        cableSnake.trail = cableSnake.trail.slice(trailIndex);
        break;
      }
    }

    if (cableSnake.headX < -50 || cableSnake.headX > viewportWidth + 50 ||
        cableSnake.headY < -50 || cableSnake.headY > viewportHeight + 50) {
      cableSnake.alive = false;
    }
  }

  function drawCableSnake(cableSnake) {
    if (!cableSnake.alive || cableSnake.trail.length < 2) return;

    for (let segmentIndex = 1; segmentIndex < cableSnake.trail.length; segmentIndex++) {
      const progressRatio = segmentIndex / cableSnake.trail.length;
      const segmentOpacity = progressRatio * 0.8;

      cableCanvasContext.beginPath();
      cableCanvasContext.moveTo(cableSnake.trail[segmentIndex - 1].x, cableSnake.trail[segmentIndex - 1].y);
      cableCanvasContext.lineTo(cableSnake.trail[segmentIndex].x, cableSnake.trail[segmentIndex].y);
      cableCanvasContext.strokeStyle = cableSnake.color + Math.floor(segmentOpacity * 255).toString(16).padStart(2, '0');
      cableCanvasContext.lineWidth = 2;
      cableCanvasContext.shadowBlur = 8;
      cableCanvasContext.shadowColor = cableSnake.color;
      cableCanvasContext.stroke();
    }

    cableCanvasContext.shadowBlur = 0;

    const headRadius = 4;
    cableCanvasContext.beginPath();
    cableCanvasContext.arc(cableSnake.headX, cableSnake.headY, headRadius, 0, Math.PI * 2);
    cableCanvasContext.fillStyle = cableSnake.color;
    cableCanvasContext.shadowBlur = 16;
    cableCanvasContext.shadowColor = cableSnake.color;
    cableCanvasContext.fill();
    cableCanvasContext.shadowBlur = 0;
  }

  function cableAnimationLoop(currentTimestamp) {
    cableCanvasContext.clearRect(0, 0, cableCanvas.width, cableCanvas.height);

    if (currentTimestamp - lastSpawnTime > nextSpawnDelay) {
      const eligibleCount = activeCables.filter(activeCable => activeCable.alive).length;
      if (eligibleCount < maxActiveCables) {
        activeCables.push(createCableSnake());
        lastSpawnTime = currentTimestamp;
        nextSpawnDelay = spawnIntervalMin + Math.random() * (spawnIntervalMax - spawnIntervalMin);
      }
    }

    activeCables.forEach(cableSnake => updateCableSnake(cableSnake));
    activeCables = activeCables.filter(cableSnake => cableSnake.alive);

    const currentActiveCount = activeCables.length;
    if (currentActiveCount < minActiveCables && currentTimestamp - lastSpawnTime > 2000) {
      activeCables.push(createCableSnake());
      lastSpawnTime = currentTimestamp;
      nextSpawnDelay = spawnIntervalMin + Math.random() * (spawnIntervalMax - spawnIntervalMin);
    }

    activeCables.forEach(cableSnake => drawCableSnake(cableSnake));

    requestAnimationFrame(cableAnimationLoop);
  }

  requestAnimationFrame(cableAnimationLoop);
})();
