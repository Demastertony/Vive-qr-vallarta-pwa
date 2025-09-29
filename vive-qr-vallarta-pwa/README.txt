# VIVE QR VALLARTA — PWA minimal
Corre en macOS Catalina sin instalar nada pesado. Funciona offline y se puede "Agregar a inicio" como App.

## Cómo probar en tu Mac (sin pagar nada)
1) Descomprime esta carpeta.
2) Abre Terminal y navega a la carpeta:
   cd vive-qr-vallarta-pwa
3) Inicia un servidor local (elige uno):
   python3 -m http.server 8000
   # o si solo tienes Python 2:
   python -m SimpleHTTPServer 8000
4) Abre: http://localhost:8000
5) En tu iPhone/Android, escanea el código QR de Localhost (o entra a la IP de tu Mac) y "Añadir a pantalla de inicio".

## Publicar gratis
- GitHub Pages o Netlify (plan gratuito). Solo subes estos archivos y listo (HTTPS automático).

## Archivos clave
- index.html — interfaz
- styles.css — estilos
- app.js — lógica básica e instalador
- service-worker.js — offline cache
- manifest.webmanifest — metadatos e íconos

## Siguientes pasos
- Conectar un lector QR real (jsQR o @zxing-js/browser).
- Agregar pantallas: Pasaporte digital, Agenda, Pueblos Mágicos, SOS, etc.
- Activar notificaciones push (Safari iOS 16.4+ admite Web Push para PWAs).

Hecho con amor 💚
