# Cómo abrir tu página Nu

## Solo para ver la página

1. Abre la carpeta `nu-asistente-financiero`.
2. Haz doble clic en el archivo `index.html`.
3. Se abrirá en tu navegador y podrás ver el diseño, el saldo simulado, movimientos y metas.

En esta forma el chat funciona solo como demostración y sus respuestas son limitadas.

## Para que el chat sea una IA de verdad

Haz esto una sola vez:

1. Instala Node.js desde https://nodejs.org. Elige la versión marcada como **LTS** y acepta las opciones que aparecen durante la instalación.
2. Necesitas una clave de OpenAI. Pídesela a la persona que administra el proyecto o crea una en la plataforma de OpenAI. Nunca pongas esa clave dentro de `index.html`.
3. Vuelve a esta carpeta, haz clic en la barra superior donde aparece la ruta de la carpeta, escribe `powershell` y presiona Enter.
4. Copia estas dos líneas, cambiando `TU_CLAVE_AQUI` por tu clave:

```powershell
$env:OPENAI_API_KEY="TU_CLAVE_AQUI"
node server.mjs
```

5. Deja abierta la ventana que apareció y abre esta dirección en tu navegador:

```text
http://localhost:3000
```

Ahora sí el asistente saludará, recordará la conversación de esa sesión y podrá responder preguntas financieras abiertas con los datos simulados.

## Cuando termines

Puedes cerrar la ventana negra de PowerShell. La próxima vez repite únicamente los pasos 3, 4 y 5.
