# Gym Voice — Estado (POC temporal)
Fecha: 2026-11-15
- Siri ejecuta `Registrar gimnasio` en el iPhone, validado por el usuario.
- Parser de origen probado en 12 tests locales; despliegue ligero de esta rama todavía requiere test real.
- App publicada como contenido estático en rama aislada `alexamz/newstudioarc:gym-voice-poc`, sin tocar `master` ni CI/infra existente.
- POC requiere datos ficticios: CDN compartida no tiene origen exclusivo.
- Objetivo posterior: mover a un repositorio dedicado + hosting de origen propio cuando sea posible sin exigir ordenador al usuario.
- Aceptación visual iPhone Safari: PASS, reportado por el usuario mediante captura 2026-11-15; pestañas, formulario y layout cargaron.
- Fallo físico observado: botón Web Speech API indica «El dictado del navegador no está disponible».
- Decisión: sustituir botón Web Speech API por acceso al dictado nativo del teclado (focus del textarea) y dejar Siri Atajos opcional. Necesita validación real del dictado teclado y del flujo guardado/refresco.
- Próxima aceptación: dictar desde el teclado iOS, interpretar, confirmar, guardar y recargar.
