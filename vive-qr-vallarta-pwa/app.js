// ======================= UTIL =======================
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Año en footer
$('#year') && ($('#year').textContent = new Date().getFullYear());

// =================== A2HS / INSTALAR =================
let deferredPrompt = null;
const btnInstall   = $('#btnInstall');
const installedNote= $('#installedNote');

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                  || window.navigator.standalone === true;

if (isStandalone) {
  document.documentElement.classList.add('pwa');
  btnInstall && (btnInstall.hidden = true);
}

window.matchMedia('(display-mode: standalone)').addEventListener?.(
  'change',
  (e)=> {
    document.documentElement.classList.toggle('pwa', e.matches);
    if (e.matches) btnInstall && (btnInstall.hidden = true);
  }
);

// Chrome/Android
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall && (btnInstall.hidden = false);
});

btnInstall?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    installedNote && (installedNote.hidden = false);
    btnInstall.hidden = true;
  }
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installedNote && (installedNote.hidden = false);
  btnInstall && (btnInstall.hidden = true);
  localStorage.setItem('pwaInstalled', '1');
});

// iOS (Safari) – hint “Compartir → Añadir a pantalla de inicio”
(function iosInstallHint(){
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const inSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const seen = localStorage.getItem('iosHintSeen') === '1';
  if (!isIOS || !inSafari || isStandalone || seen) return;

  const css = `
  #ios-hint{position:fixed;left:12px;right:12px;bottom:12px;z-index:50;
    background:rgba(11,16,32,.9);color:#e9f1ff;border:1px solid rgba(255,255,255,.1);
    border-radius:14px;padding:12px 14px;backdrop-filter:blur(8px);
    box-shadow:0 16px 40px rgba(0,0,0,.45);font:14px/1.4 system-ui,-apple-system;}
  #ios-hint b{color:#17d88a}
  #ios-hint button{all:unset;position:absolute;right:10px;top:8px;cursor:pointer;color:#9ab7ff}
  `;
  const style = document.createElement('style'); style.textContent = css;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'ios-hint';
  el.innerHTML = `
    <button aria-label="Cerrar">✕</button>
    Para instalar: toca <b>Compartir</b> → <b>Añadir a pantalla de inicio</b>.
  `;
  document.body.appendChild(el);
  el.querySelector('button').onclick = () => {
    el.remove();
    localStorage.setItem('iosHintSeen','1');
  };
})();

// =================== SERVICE WORKER ===================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((reg) => {
      // Cuando el SW nuevo está listo
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast(() => {
              // Pide al SW activar inmediatamente
              nw.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        });
      });
    });

    // Recarga cuando el nuevo SW toma control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  });
}

// Pequeño toast para la actualización
function showUpdateToast(onConfirm){
  if ($('#upd-toast')) return;
  const css = `
  #upd-toast{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;
    background:rgba(11,16,32,.95);color:#e9f1ff;border:1px solid rgba(255,255,255,.1);
    border-radius:14px;padding:12px 14px;backdrop-filter:blur(8px);
    box-shadow:0 16px 40px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center;}
  #upd-toast button{all:unset;cursor:pointer;background:#17d88a;color:#05291a;
    font-weight:800;padding:10px 14px;border-radius:10px;margin-left:auto;}
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const t = document.createElement('div'); t.id = 'upd-toast';
  t.innerHTML = `<span>Hay una actualización disponible.</span><button>Actualizar</button>`;
  document.body.appendChild(t);
  t.querySelector('button').onclick = () => { onConfirm?.(); t.remove(); };
}

// ===== Demo cámara (tu vista previa) =====
const fileInput = $('#fileInput');
const canvas    = $('#preview');
const ctx       = canvas?.getContext('2d');

fileInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file || !canvas) return;
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, x, y, w, h);
  };
  img.src = URL.createObjectURL(file);
});

// ===== Tilt suave (respeta reduce-motion) =====
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tilt = (el, max=8) => {
    let rect;
    const measure = () => rect = el.getBoundingClientRect();
    const move = (e) => {
      if (!rect) measure();
      const cx = (e.clientX ?? 0) - (rect.left + rect.width/2);
      const cy = (e.clientY ?? 0) - (rect.top  + rect.height/2);
      const x = cx / (rect.width /2);
      const y = cy / (rect.height/2);
      el.style.transform = `perspective(900px) rotateY(${x*max}deg) rotateX(${-y*max}deg)`;
    };
    const reset = () => el.style.transform = '';
    el.addEventListener('pointerenter', measure, {passive:true});
    el.addEventListener('pointermove',  move,    {passive:true});
    el.addEventListener('pointerleave', reset,   {passive:true});
  };

  const screen = $('.screen-pro');
  const tiles  = $$('.tile');
  if (screen) tilt(screen, 6);
  tiles.forEach(t => tilt(t, 4));
})();
