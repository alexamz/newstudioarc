# Gym Voice — Estado (POC temporal)
Fecha: 2026-11-15
- Siri ejecuta `Registrar gimnasio` en el iPhone, validado por el usuario.
- Parser de origen probado en 12 tests locales; despliegue ligero de esta rama todavía requiere test real.
- App publicada como contenido estático en rama aislada `alexamz/newstudioarc:gym-voice-poc`, sin tocar `master` ni CI/infra existente.
- POC requiere datos ficticios: CDN compartida no tiene origen exclusivo.
- Objetivo posterior: mover a un repositorio dedicado + hosting de origen propio cuando sea posible sin exigir ordenador al usuario.
- Próxima aceptación: abrir URL en iPhone, verificar importación de dictado, edición, guardado y refresco.
