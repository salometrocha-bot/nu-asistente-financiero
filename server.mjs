import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 3000);

function readEnvFile() {
  try {
    const envPath = join(
      fileURLToPath(new URL(".", import.meta.url)),
      ".env"
    );

    const text = readFileSync(envPath, "utf8");

    for (const line of text.split(/\r?\n/)) {
      const match = line.match(
        /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/
      );

      if (!match || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Si no existe .env, continuamos y mostraremos el error correspondiente.
  }
}

readEnvFile();

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const root = process.cwd();

const financialContext = `
Eres el asistente financiero de un PROTOTIPO educativo.

Responde siempre en español claro, cálido y preciso.

Todos los montos y datos son SIMULADOS; nunca pidas datos bancarios reales,
contraseñas, tarjetas ni documentos.

Contexto financiero simulado de Salo:

- Saldo disponible: COP 1.850.000
- Ingresos del mes: COP 2.400.000
- Gastos del mes: COP 550.000
- Meta de ahorro: COP 1.500.000
- Ahorro acumulado: COP 800.000
- Falta para la meta: COP 700.000

Gastos por categoría:

- Alimentación: COP 176.000
- Transporte: COP 115.000
- Entretenimiento: COP 99.000
- Otros: COP 160.000

Responde preguntas abiertas sobre presupuesto, ahorro, deudas, intereses,
tarjetas, cuotas, inflación, inversiones, seguros, compras y educación
financiera.

Haz cálculos cuando los datos alcancen y muestra el cálculo de forma breve.

Si faltan datos, dilo y pide solo los mínimos necesarios.

No inventes tasas, productos, normativa, impuestos ni precios actuales.

Para inversiones, crédito, impuestos, salud o decisiones de alto impacto,
ofrece educación general, explica riesgos y sugiere contrastar con un
profesional autorizado.

No prometas rendimientos ni tomes decisiones por la persona.

Prioriza:
1. conclusión,
2. razonamiento breve,
3. siguiente paso útil.

En el primer turno, saluda a Salo de forma natural antes de responder.

En los siguientes turnos, recuerda la conversación y no repitas la
presentación.
`;

function send(
  res,
  status,
  body,
  type = "application/json"
) {
  res.writeHead(status, {
    "Content-Type": `${type}; charset=utf-8`
  });

  res.end(
    typeof body === "string"
      ? body
      : JSON.stringify(body)
  );
}

function safeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

createServer(async (req, res) => {

  // Comprobar que el servidor y la API Key están configurados
  if (
    req.method === "GET" &&
    req.url === "/api/health"
  ) {
    return send(res, 200, {
      ok: true,
      apiKeyConfigured: Boolean(
        process.env.OPENAI_API_KEY
      ),
      model
    });
  }

  // Chat con OpenAI
  if (
    req.method === "POST" &&
    req.url === "/api/chat"
  ) {
    if (!apiKey) {
      return send(res, 503, {
        error:
          "Falta configurar OPENAI_API_KEY. Crea un archivo .env junto a server.mjs o configura la variable de entorno antes de iniciar el servidor."
      });
    }

    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", async () => {
      try {
        const {
          message,
          previousResponseId
        } = JSON.parse(raw);

        if (
          !message ||
          String(message).length > 4000
        ) {
          return send(res, 400, {
            error: "Mensaje no válido."
          });
        }

        const apiResponse = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },

            body: JSON.stringify({
              model,
              instructions: financialContext,
              input: String(message),
              previous_response_id:
                previousResponseId || undefined,
              max_output_tokens: 700
            })
          }
        );

        const payload = await apiResponse.json();

        if (!apiResponse.ok) {
          const detail =
            payload?.error?.message ||
            `OpenAI respondió con HTTP ${apiResponse.status}.`;

          const error = new Error(detail);
          error.status = apiResponse.status;

          throw error;
        }

       const answer = (payload.output || [])
  .filter(item => item.type === "message")
  .flatMap(item => item.content || [])
  .filter(part => part.type === "output_text" && part.text)
  .map(part => part.text)
  .join("\n")
  .trim();

if (!answer) {
  throw new Error(
    payload.incomplete_details?.reason
      ? `La respuesta quedó incompleta: ${payload.incomplete_details.reason}`
      : "OpenAI no devolvió texto en la respuesta."
  );
}
        send(res, 200, {
          answer: safeHtml(answer).replace(
            /\n/g,
            "<br>"
          ),
          responseId: payload.id
        });

      } catch (error) {
        console.error(
          "/api/chat error:",
          error
        );

        send(
          res,
          error.status || 502,
          {
            error:
              error.message ||
              "Error al consultar el asistente."
          }
        );
      }
    });

    return;
  }

  // Servir la página web y sus archivos
  const requested =
    req.url === "/"
      ? "index.html"
      : decodeURIComponent(
          req.url
            .split("?")[0]
            .replace(/^\/+/, "")
        );

  const file = normalize(
    join(root, requested)
  );

  // Evitar que se puedan solicitar archivos fuera de la carpeta
  if (!file.startsWith(root)) {
    return send(
      res,
      403,
      "No autorizado",
      "text/plain"
    );
  }

  try {
    const content = await readFile(file);

    const types = {
      ".html":
        "text/html; charset=utf-8",
      ".css":
        "text/css; charset=utf-8",
      ".js":
        "text/javascript; charset=utf-8"
    };

    res.writeHead(200, {
      "Content-Type":
        types[extname(file)] ||
        "application/octet-stream"
    });

    res.end(content);

  } catch (error) {
    console.error(
      "Error cargando archivo:",
      file,
      error.message
    );

    send(
      res,
      404,
      "No encontrado",
      "text/plain"
    );
  }

}).listen(port, "0.0.0.0", () => {
  console.log(
    `Nu demo: http://localhost:${port}`
  );
});
