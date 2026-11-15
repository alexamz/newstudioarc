# Gym Voice — Contrato de interpretación inteligente (diseño POC, no desplegado)

## Objetivo
Convertir voz transcrita en ejercicios, series, repeticiones y kg, detectando incertidumbre semántica. El reconocimiento del teclado iPhone ha sido aceptado; **el parser regex no ha sido aceptado para uso real**.

## Flujo mínimo
iOS dictado de teclado → texto original → endpoint HTTPS de interpretación con una credencial revocable y límite de uso → modelo de lenguaje con salida JSON Schema estricta → validación de negocio en backend y frontend → revisión de ambigüedades → guardado local de la sesión. No enviar claves al navegador ni a un repositorio. No almacenamiento remoto para la POC, salvo servicio ligero de interpretación.

Solicitar al modelo un contexto opcional de nombres de ejercicios de la rutina activa y alias personales. No depender de un catálogo externo exhaustivo.

## Salida conceptual
```json
{
  "exercises": [
    {
      "name": "press banca",
      "source_fragment": "press banca, tres series de 10,40 kilos y dos series de 10,45 kilos",
      "sets": [
        {"reps":10,"weightKg":40},
        {"reps":10,"weightKg":40},
        {"reps":10,"weightKg":40},
        {"reps":10,"weightKg":45},
        {"reps":10,"weightKg":45}
      ],
      "needsReview": false,
      "question": null
    }
  ],
  "unresolved": [],
  "needsReview": false
}
```
Es un ejemplo de formato, no una respuesta de API real. Usar JSON Schema estricto, validación server-side y verificar que el modelo no añada series. La confianza no se debe representar con números inventados.

## Casos de aceptación
1. Frase irregular de press banca: 3x10@40 + 2x10@45; NO interpretar '10,40' como 10.40 kg.
2. Remo narrado: hipótesis 10@40, 8@45, 6@50, pero cifra adicional aislada → **preguntar antes de guardar**, no descartar ni inventar.
3. Nombre de ejercicio transcrito como un fragmento ininteligible, p.ej. 'ps' → **nombre desconocido, preguntar**; no asumir curl de bíceps.
4. Una serie con repeticiones ausentes → reps=null, explicar dato ausente.
5. Comandos «corrige», «añade» y «sustituye» → acciones explícitas, no duplicar datos guardados.
6. Frases con pesos distintos y repeticiones distintas por serie y ejercicio.
7. Dictados de entrenamiento completo con varios ejercicios y pausas.
8. No guardar silenciosamente entradas ambiguas, aunque estén en JSON válido.

## No objetivos iniciales
No cambiar Boletaire, no levantar Postgres, no crear cuentas, no desplegar un LLM persistente ni pagar transcripción salvo que el texto nativo siga perdiendo información crítica.

## Bloqueo real de publicación
La web temporal vive como HTML estático bajo un origen CDN compartido; no existe endpoint privado con credencial del proveedor de IA. La suscripción ChatGPT Plus no constituye por sí sola una credencial API. La siguiente versión necesita un origen propio con proxy serverless mínimo y secreto configurado fuera del código; no es apropiado invocar la API desde JavaScript del navegador. Hasta tenerlo, el modo local sigue marcado experimental y solo se usan datos ficticios.
