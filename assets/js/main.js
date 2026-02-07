import { barcaState } from './core/state.js';
import { barcaAPI } from './core/api.js';
import { barcaPrefetch } from './router/prefetch.js';
import { barcaRouter } from './router/router.js';
import { barcaPulse } from './live/pulse.js';
import { barcaSync } from './live/sync.js';
import { barcaEvents } from './live/events.js';
import { barcaAmbient } from './ui/ambient.js';
import { barcaAnimations } from './ui/animations.js';
import { updateDateDisplay } from './core/utils.js';

// Import Legacy Scripts (Global scope is maintained via window object)
import '../../js/i18n.js';
import '../../js/components.js';
import '../../js/api.js';
import '../../js/app.js';

// Notification Helper
const sendNotification = (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: '/assets/favicons/android-chrome-192x192.png',
      badge: '/assets/favicons/favicon-32x32.png',
      vibrate: [200, 100, 200]
    });
  }
};

/**
 * BarcaLive SPA Entry Point
 * Orchestrates the initialization of all modules.
 */
const initSPA = () => {
  // Initialize language as early as possible to prevent flicker
  window.I18n.init();

  // Request Notification Permission
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  // Expose core instances to window for legacy scripts/debugging immediately
  window.barcaState = barcaState;
  window.barcaAPI = barcaAPI;
  window.barcaRouter = barcaRouter;
  window.barcaPrefetch = barcaPrefetch;
  window.barcaAmbient = barcaAmbient;
  window.barcaAnimations = barcaAnimations;


  try {
    // 1. Initialize Prefetch
    barcaPrefetch.init();
    barcaPrefetch.warmup([
      '/overview.html',
      '/schedule.html',
      '/results.html',
      '/la-liga.html',
      '/ucl.html'
    ]);

    // 2. Initialize Router
    barcaRouter.init();
    updateDateDisplay();
    window.addEventListener('langChanged', () => updateDateDisplay());

    // 3. Dynamic Island Integration
    import('../../js/dynamic-island.js')
      .catch(() => console.warn('⚠️ Dynamic Island not found or failed to load'));

    // 4. Initial Page Initialization (if not already handled by scripts)
    const container = document.getElementById('app-content');
    if (container && container.dataset.init) {
      const initFn = container.dataset.init;
      if (typeof window[initFn] === 'function') {
        window[initFn]();
      }
    }

    // 5. Smart Polling System (BarcaPulse)
    barcaSync.registerDetector('matchEvents', (old, current) => {
      barcaEvents.checkForMatchEvents(old, current);
    });

    barcaPulse.subscribe((matches) => {
      // Find the most relevant match: live, or the closest one (past or future)
      const now = new Date();
      const barcaMatch = matches.sort((a, b) => {
        const diffA = Math.abs(new Date(a.utcDate) - now);
        const diffB = Math.abs(new Date(b.utcDate) - now);
        return diffA - diffB;
      })[0];

      if (barcaMatch) {
        barcaSync.process(barcaMatch);
      }
    });

    barcaPulse.start();

    barcaAmbient.init();
    checkAppVersion();

    // Ensure we are in idle state if data is already in cache (pre-loaded from index)
    if (barcaAPI._cache && barcaAPI._cache.has('allData')) {
      barcaState.setState('idle');
    }

    barcaEvents.on('GOAL', (data) => {
      const teamName = data.team === 'home' ? data.match.homeTeam.shortName : data.match.awayTeam.shortName;
      const scoreStr = `${data.score.home} - ${data.score.away}`;
      sendNotification('GOL! ⚽', `${teamName} strzela! Wynik: ${scoreStr}`);
    });

    barcaEvents.on('MATCH_START', (data) => {
      const m = data.match;
      sendNotification('Mecz się rozpoczął! 🟢', `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`);
    });

    barcaEvents.on('MATCH_END', (data) => {
      const m = data.match;
      const score = `${m.score.fullTime.home} - ${m.score.fullTime.away}`;
      sendNotification('Koniec Meczu 🔴', `Wynik końcowy: ${score}`);
    });

    // 6. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW Registered:', reg.scope))
        .catch(err => console.error('SW Registration Failed:', err));
    }

  } catch (error) {
    console.error('❌ SPA Initialization Error:', error);
  } finally {
  }
};

/**
 * Checks for mobile app version and shows promotion if version is 1
 */
async function checkAppVersion() {
  try {
    const response = await fetch('/app/app.json');
    if (!response.ok) return;

    const config = await response.json();
    if (config.version === 1) {
      showAppPromo(config);
    }
  } catch (e) {
    console.warn('App version check failed:', e);
  }
}

function showAppPromo(config) {
  const lang = 'pl'; // Strict Polish
  const appName = typeof config.appName === 'object' ? (config.appName['pl'] || config.appName) : config.appName;
  const description = config.description['pl'] || config.description;
  const downloadBtn = 'Pobierz';
  const closeBtn = 'Może później';

  const overlay = document.createElement('div');
  overlay.id = 'app-promo-overlay';
  overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-3xl animate-in';

  overlay.innerHTML = `
        <div class="glass-premium p-8 max-w-sm w-full text-center border-white/20 shadow-2xl">
            <div class="w-20 h-20 bg-gold rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(237,187,0,0.4)]">
                <i data-lucide="smartphone" class="w-10 h-10 text-black"></i>
            </div>
            <h2 class="text-2xl font-black tracking-tighter mb-2">${appName}</h2>
            <p class="text-white/60 text-sm leading-relaxed mb-8">${description}</p>

            <div class="flex flex-col gap-3">
                <a href="${config.downloadUrl}" class="bg-white text-black py-4 rounded-2xl font-bold hover:scale-105 transition-transform">
                    ${downloadBtn}
                </a>
                <button onclick="document.getElementById('app-promo-overlay').remove()" class="text-white/40 text-xs font-bold uppercase tracking-widest py-2 hover:text-white transition-colors">
                    ${closeBtn}
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);
  if (window.lucide) window.lucide.createIcons();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSPA);
} else {
  initSPA();
}

