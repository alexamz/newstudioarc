# Gym Voice — POC alojada temporalmente

Esta rama `gym-voice-poc` está deliberadamente aislada de `master` del repositorio histórico `newstudioarc`; NO modifica Azure ni sus workflows. La app de prueba se aloja mediante el servicio externo raw.githack.com, sin infraestructura nueva. Es una demo desechable, no el repositorio de producción definitivo.

## Probar

Abrir `https://raw.githack.com/alexamz/newstudioarc/gym-voice-poc/gym-voice/index.html` y confirmar aviso inicial del proveedor si aparece. En `Hoy` introducir `Remo con barra, tres series con 40 kilos, 10, 9 y 8 repeticiones`, interpretar, revisar tres series y guardar. Revisar Progreso y recarga.

El Atajo Siri puede usar la URL anterior seguida de `#voice=` y el dictado codificado. El navegador debe ser el mismo en cada uso.

## Privacidad importante

Raw.githack.com sirve contenidos de muchos repositorios bajo el mismo origen, por lo que `localStorage` **no tiene el aislamiento de una web propia**. Usar solo datos ficticios en esta prueba. No introducir datos de entrenamiento personales o sensibles. No guardar contraseñas ni claves. Para diario real, migrar a hospedaje con origen propio y almacenamiento adecuado. El proveedor muestra un aviso de protección ante HTML de terceros. El alojamiento no garantiza disponibilidad ni largo plazo.

## Estado

Código original completo y tests de 12 escenarios están en `gym-voice-source.zip` generado en este chat. Esta variante HTML de despliegue es una versión simplificada creada para reducir los pasos de publicación: soporta modos durante/final, edición y confirmación, rutinas de texto, histórico básico, exportación JSON, atajo URL `#voice=`, cache offline. No tiene sincronización ni IA. Safari iPhone: interfaz y dictado nativo + interpretación básica aceptados 2026-11-15. Pendiente validación física de guardado, recarga y casos complejos.

## Dictado iPhone (2026-11-15)

En Safari iPhone real la POC abrió correctamente, pero el botón anterior `SpeechRecognition` notificó «El dictado del navegador no está disponible». Se elimina el reconocimiento de voz del navegador como dependencia. Desde Hoy usar `Dictar con teclado` (enfoca el campo) y pulsar el micrófono del teclado nativo Apple; después `Interpretar dictado`, comprobar las series y guardar. Siri/Atajos permanece como alternativa opcional hasta una prueba end-to-end. El usuario ya ha confirmado que el dictado del teclado y la interpretación básica funcionan en el iPhone.

## Comprobación automatizada (sin CI)

Ejecutar `node --test gym-voice/tests/parser.test.mjs` desde la raíz del repositorio. La prueba reproduce 19 frases, pesos y repeticiones y confirma el número de alertas. No requiere npm, Azure ni servicios externos.

## Limitación crítica y siguiente hito

Pruebas de voz reales (2026-11-15): el dictado nativo de iOS funciona y la interpretación de un ejercicio simple funciona; expresiones más naturales sobre pesos/repeticiones y ejercicios degradan el parser de reglas. Las pruebas sintéticas no equivalen a aceptación semántica. La interfaz avisa de que el intérprete actual es experimental. Ver `docs/PROJECT_STATE.md` y `docs/AI_INTERPRETATION_CONTRACT.md`. No integrar claves OpenAI en código estático ni reutilizar sin más el backend/secretos de otros proyectos.


## Importación estructurada desde ChatGPT (sin backend)
ChatGPT interpreta el texto que le dictes y genera un enlace con fragmento `#import=${encodeURIComponent(JSON.stringify(payload))}` donde `payload` es un objeto como:
```json
{"v":1,"source":"chatgpt","raw":"Press banca, tres series de diez con cuarenta kilos","entries":[{"name":"press banca","sets":[{"reps":10,"weight":40},{"reps":10,"weight":40},{"reps":10,"weight":40}]}],"unresolved":[]}
```
El enlace debe usar la URL pública de Gym antes del fragmento y solo debe provenir de un mensaje de ChatGPT después de interpretar el dictado. La PWA valida versión, origen declarado, longitud, 12 ejercicios máximo, 20 series/ejercicio, datos numéricos y preguntas sin resolver. **No guarda automáticamente:** hay que confirmar las series. Esta es una solución intermedia para la POC, no una integración de API en la app. **Solo datos ficticios** hasta tener alojamiento propio.

## Importación de ChatGPT — corrección de experiencia

La importación #import muestra primero los ejercicios estructurados para confirmar, sin botón de interpretación básica que pueda sobrescribirlos. El resumen inicial indica el número de series recibidas. Cambiar Durante la sesión/Todo al final no borra el texto original. Si la pantalla muestra 'Interpretar (básico)' junto al dictado original, no está en el flujo estructurado: abrir nuevamente el enlace de importación. La causa exacta del resultado observado en iPhone aún requiere aceptación física.

## Sesiones guardadas y persistencia
The local-only POC now records workouts and routines atomically (write succeeds before in-memory state is changed) and shows each saved session and its sets under Progreso. Reload in the SAME browser to verify localStorage persistence. The ChatGPT embedded browser, Safari and an installed PWA may use separate stores. This is not yet a synced personal diary. The existing Exportar copia JSON is backup-export only, and restoration is not yet implemented. Avoid real data on shared CDN origin.
