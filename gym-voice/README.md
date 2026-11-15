# Gym Voice — POC alojada temporalmente

Esta rama `gym-voice-poc` está deliberadamente aislada de `master` del repositorio histórico `newstudioarc`; NO modifica Azure ni sus workflows. La app de prueba se aloja mediante el servicio externo raw.githack.com, sin infraestructura nueva. Es una demo desechable, no el repositorio de producción definitivo.

## Probar

Abrir `https://raw.githack.com/alexamz/newstudioarc/gym-voice-poc/gym-voice/index.html` y confirmar aviso inicial del proveedor si aparece. En `Hoy` introducir `Remo con barra, tres series con 40 kilos, 10, 9 y 8 repeticiones`, interpretar, revisar tres series y guardar. Revisar Progreso y recarga.

El Atajo Siri puede usar la URL anterior seguida de `#voice=` y el dictado codificado. El navegador debe ser el mismo en cada uso.

## Privacidad importante

Raw.githack.com sirve contenidos de muchos repositorios bajo el mismo origen, por lo que `localStorage` **no tiene el aislamiento de una web propia**. Usar solo datos ficticios en esta prueba. No introducir datos de entrenamiento personales o sensibles. No guardar contraseñas ni claves. Para diario real, migrar a hospedaje con origen propio y almacenamiento adecuado. El proveedor muestra un aviso de protección ante HTML de terceros. El alojamiento no garantiza disponibilidad ni largo plazo.

## Estado

Código original completo y tests de 12 escenarios están en `gym-voice-source.zip` generado en este chat. Esta variante HTML de despliegue es una versión simplificada creada para reducir los pasos de publicación: soporta modos durante/final, edición y confirmación, rutinas de texto, histórico básico, exportación JSON, atajo URL `#voice=`, cache offline. No tiene sincronización ni IA. La aceptación real en Safari iPhone sigue pendiente.
