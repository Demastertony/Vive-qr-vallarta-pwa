
// Install prompt
let deferredPrompt;
const btn = document.getElementById('btnInstall');
const installedNote = document.getElementById('installedNote');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btn.hidden = false;
});
btn?.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if(outcome === 'accepted'){ installedNote.hidden = false; btn.hidden = true; }
  deferredPrompt = null;
});
window.addEventListener('appinstalled', () => { installedNote.hidden = false; btn.hidden = true; });

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Service worker
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/service-worker.js');
  });
}

// Demo camera picker
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
fileInput?.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const img = new Image();
  img.onload = ()=>{
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    const x = (canvas.width - w)/2, y=(canvas.height - h)/2;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, x, y, w, h);
  };
  img.src = URL.createObjectURL(file);
});

// Tilt suave para la pantalla y las tiles (respeta reduce motion)
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const tilt = (el, max=8) => {
    let rect;
    const measure = () => rect = el.getBoundingClientRect();
    const move = (e) => {
      if (!rect) measure();
      const x = ((e.clientX ?? 0) - (rect.left + rect.width/2)) / (rect.width/2);
      const y = ((e.clientY ?? 0) - (rect.top + rect.height/2)) / (rect.height/2);
      el.style.transform = `perspective(900px) rotateY(${x*max}deg) rotateX(${-y*max}deg)`;
    };
    const reset = () => el.style.transform = '';
    el.addEventListener('pointerenter', measure);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
  };

  const screen = document.querySelector('.screen-pro');
  const tiles  = document.querySelectorAll('.tile');
  if (screen) tilt(screen, 6);
  tiles.forEach(t => tilt(t, 4));
})();
