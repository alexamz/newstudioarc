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
