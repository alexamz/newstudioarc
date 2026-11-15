# Gym Voice — Decisiones
- 2026-11-15: velocidad de POC sobre infraestructura; sin backend ni nuevos recursos Azure.
- Modos durante y todo al final comparten un modelo de sesión.
- Un dictado nunca se guarda sin confirmación del usuario.
- Repeticiones >40 se marcan como ambiguas y bloquean hasta corregir.
- Uso temporal de una rama aislada en `newstudioarc` (master intacto); CDN pública solo para pruebas con datos ficticios por riesgo de origen compartido.
- Sin duplicar workflows de Azure. Sin commits pequeños: una publicación atómica.
- 2026-11-15: tras fallo real de SpeechRecognition en Safari iPhone, preferir dictado nativo del teclado (sin SDK ni servicios de pago), con botón que enfoca textarea. Mantener Atajos fuera del flujo principal hasta aceptación.
