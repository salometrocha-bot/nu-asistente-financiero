# Arreglo del chatbot

Tu proyecto ya está preparado para usar la API de OpenAI sin exponer la clave en el navegador.

## 1. Crea tu clave
En la plataforma de OpenAI crea una API key del proyecto que tiene los créditos. **No la pegues en `index.html` ni `script.js`.**

## 2. Configúrala
En esta misma carpeta crea un archivo llamado `.env` con:

```text
OPENAI_API_KEY=TU_CLAVE_AQUI
OPENAI_MODEL=gpt-5.6-luna
```

El archivo `.env` está ignorado para que no se suba por accidente a un repositorio.

## 3. Arranca la página
En PowerShell, dentro de esta carpeta:

```powershell
node server.mjs
```

Después abre:

`http://localhost:3000`

## 4. Comprobar configuración
Abre `http://localhost:3000/api/health`. Debe aparecer `apiKeyConfigured: true`.

Si aparece `false`, el servidor no está viendo la clave.

## Importante
No compartas tu API key por chat, capturas, GitHub ni dentro de archivos HTML/JS. OpenAI recomienda mantenerla en el servidor/variables de entorno.
