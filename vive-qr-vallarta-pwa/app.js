
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
