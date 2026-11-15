# Gym Voice — Estado (POC temporal)
Fecha: 2026-11-15
- Siri ejecuta `Registrar gimnasio` en el iPhone, validado por el usuario.
- Parser de origen probado en 12 tests locales; despliegue ligero de esta rama todavía requiere test real.
- App publicada como contenido estático en rama aislada `alexamz/newstudioarc:gym-voice-poc`, sin tocar `master` ni CI/infra existente.
- POC requiere datos ficticios: CDN compartida no tiene origen exclusivo.
- Objetivo posterior: mover a un repositorio dedicado + hosting de origen propio cuando sea posible sin exigir ordenador al usuario.
- Aceptación visual iPhone Safari: PASS, reportado por el usuario mediante captura 2026-11-15; pestañas, formulario y layout cargaron.
- Fallo físico observado: botón Web Speech API indica «El dictado del navegador no está disponible».
- Decisión: sustituir botón Web Speech API por acceso al dictado nativo del teclado (focus del textarea) y dejar Siri Atajos opcional. Dictado por teclado + interpretación: PASS reportado por usuario en Safari iPhone 2026-11-15. Guardado/refresco: aún sin confirmación física.
- Parser reforzado: 19 casos sintéticos PASS, incluyendo grupos de pesos, 3x10, 90s descanso, ejercicios unidos por «y» y el fallo 98/siete de Siri.
- Próxima aceptación: dictar caso complejo, revisar, guardar y confirmar persistencia tras recarga.

## Cambio de dirección 2026-11-15 tras dictados reales

STATUS_REAL_WORLD_SEMANTIC_PARSING = FAIL / NO_GO_AS_FINAL_PRODUCT
VOICE_CAPTURE_IOS_KEYBOARD = ACCEPTED_FOR_POC
RULE_BASED_PARSER = EXPERIMENTAL_FALLBACK_ONLY
INTELLIGENT_INTERPRETATION = PRIORITY_NEXT / NOT_DEPLOYED

El usuario probó dictados reales con notación oral poco regular. Los 19 tests sintéticos pasan, pero no cubren estas transcripciones. Ejemplo sintético: 'press banca tres series de diez cuarenta kilos y dos series de diez cuarenta y cinco kilos' debe representar 3x10@40 kg + 2x10@45 kg. Segundo escenario: series de remo con 40, 45 y 50 kg y una cifra extraviada; ejercicio siguiente transcrito como dos letras ambiguas. La app no debe inventar la serie dudosa ni el ejercicio desconocido. Las correcciones mediante regex específicas no cumplen el producto solicitado.

Próxima implementación: un LLM de texto produce JSON estructurado con ejercicios normalizados, series y preguntas de aclaración, mediante un endpoint autenticado que custodie la API key; nunca exponerla en el frontend ni en la CDN compartida. Guardar solo después de revisar datos ambiguos. Backend/clave todavía no configurados ni publicados. Captura de audio con transcripción contextual queda como alternativa si el dictado de iOS continúa perdiendo datos críticos. La POC sigue en alojamiento temporal: usar datos ficticios.

## Bridge ChatGPT → Gym POC — 2026-11-15

Implementado `#import=` con JSON de estructura limitada y sin auto-guardado. ChatGPT puede entender el dictado y entregar un enlace directo con el entrenamiento interpretado, que la PWA muestra para revisión y confirmación. Es un puente manual de **un toque** sin API ni backend; no significa que la PWA ya llame a IA. El formato es privado solo en el sentido de que URL fragment no se envía por HTTP, pero la demo sigue compartiendo origen CDN con aplicaciones ajenas y **solo admite datos ficticios**. Requiere aceptación en Safari iPhone. Integración Azure Foundry queda pendiente de gateway aislado y autorización específica de identidad administrada.

## WP bridge UX fix — 2026-11-15
User physical screenshot: link into #import displayed raw voice text and a warning '1. Faltan repeticiones' from the local parser. This warning does NOT originate in ChatGPT's structured interpretation. Exact cause (reparse tap vs fragment handoff) cannot be established from screenshot. Previously the page displayed local dictation and its 'Interpretar (básico)' button above imported structured results; the user could innocently overwrite the imported result. Fix: if an AI-reviewed import is present, prioritize the confirmation view, show structured series first, and hide the local interpreter entirely. Switching between Durante/Todo al final now preserves original transcript. No auto-save; needs acceptance on iPhone. No Azure mutation or CI.
