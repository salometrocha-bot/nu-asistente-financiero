# Nu — Asistente financiero (prototipo)

“Nu” aparece solo como texto de referencia dentro de un prototipo educativo. No contiene logo oficial ni conexión bancaria real. Todos los datos son simulados.

## Chat que responde preguntas abiertas

La clave de API se conserva en el servidor; nunca aparece en el HTML ni se envía al navegador.

1. Instala Node.js 18 o superior.
2. Abre una terminal en esta carpeta.
3. Ejecuta:

   ```powershell
   $env:OPENAI_API_KEY="tu_clave"
   node server.mjs
   ```

4. Abre `http://localhost:3000`.

Opcionalmente selecciona un modelo compatible:

```powershell
$env:OPENAI_MODEL="gpt-5"
node server.mjs
```

Importante: no abras `index.html` con doble clic si quieres la IA real; en ese caso solo se activa el modo de demostración. Después de ejecutar `node server.mjs`, abre exactamente `http://localhost:3000`. Con el servidor y una clave, el asistente saluda a Salo, responde preguntas abiertas sobre finanzas, recuerda la conversación dentro de la sesión y toma en cuenta el escenario ficticio.
