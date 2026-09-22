const panel = document.querySelector('#chatPanel');
const messages = document.querySelector('#chatMessages');
const input = document.querySelector('#messageInput');
const form = document.querySelector('#chatForm');
const toast = document.querySelector('.toast');
let previousResponseId = null;

function openChat(prompt) { panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); if (prompt) sendMessage(prompt); else setTimeout(() => input.focus(), 180); }
function closeChat() { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
function addMessage(content, sender) { const bubble = document.createElement('div'); bubble.className = `message ${sender}`; bubble.innerHTML = content; messages.appendChild(bubble); messages.scrollTop = messages.scrollHeight; }
function fallbackResponse(text) {
  const t = text.toLowerCase();
  if (/gast|semana|presupuesto|cuánto puedo/.test(t)) return 'Con tu saldo simulado de <b>$1.850.000</b>, y para no desviar tu meta de ahorro, podrías reservar unos <b>$180.000</b> para esta semana. Si tienes una compra concreta, dime cuánto cuesta y la revisamos juntas.';
  if (/más|categor|en qué/.test(t)) return 'Tu mayor gasto simulado es <b>alimentación</b>: $176.000 (32%). Le siguen otros gastos ($160.000), transporte ($115.000) y entretenimiento ($99.000). Un buen primer paso sería poner un tope semanal para alimentación.';
  if (/ahorr|meta/.test(t)) return 'Ya llevas <b>$800.000 de $1.500.000</b>: 53% de tu meta. Te faltan $700.000. Si separas $350.000 al mes, podrías alcanzarla en aproximadamente <b>2 meses</b>.';
  if (/compr|audífono|iphone|celular|cuesta|contado/.test(t)) return 'Tu saldo simulado sí cubriría esa compra. Antes de decidir, mira que tu meta aún necesita $700.000: intenta conservar esa cantidad separada y compara el costo total si piensas pagar a cuotas. ¿Cuánto cuesta exactamente?';
  if (/deuda|tarjeta|interés|cuota/.test(t)) return 'Para una deuda, normalmente conviene priorizar la que tenga la tasa más alta y mantener al día los pagos mínimos. Si me cuentas saldo, tasa y cuota, te ayudo a ordenar un plan usando este escenario simulado.';
  return 'Para responderte con más detalle a cualquier pregunta financiera, inicia el servidor del proyecto y configura tu clave de API. Mientras tanto, puedo orientarte con estos datos simulados: saldo $1.850.000, ingresos $2.400.000, gastos $550.000 y meta $1.500.000.';
}
async function sendMessage(text) {
  const value = (text || input.value).trim();
  if (!value) return;
  addMessage(value, 'user'); input.value = '';
  const typing = document.createElement('div'); typing.className = 'message assistant'; typing.textContent = 'Analizando tu consulta…'; messages.appendChild(typing); messages.scrollTop = messages.scrollHeight;
  try {
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: value, previousResponseId }) });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.error || `El servidor respondió con ${response.status}`);
    }
    const data = await response.json();
    previousResponseId = data.responseId || null;
    typing.remove(); addMessage(data.answer, 'assistant');
  } catch (error) {
    console.warn('Asistente API:', error);
    setTimeout(() => {
      typing.remove();
      addMessage(fallbackResponse(value), 'assistant');
    }, 380);
  }
}
document.querySelectorAll('.open-chat').forEach(button => button.addEventListener('click', () => openChat()));
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => openChat(button.dataset.prompt)));
document.querySelector('.close-chat').addEventListener('click', closeChat);
document.querySelector('.chat-backdrop').addEventListener('click', closeChat);
form.addEventListener('submit', event => { event.preventDefault(); sendMessage(); });
document.querySelector('#hideBalance').addEventListener('click', event => { const money = document.querySelector('.balance-value'); const hidden = money.textContent.includes('•'); money.textContent = hidden ? '$1.850.000' : '••••••••'; event.currentTarget.innerHTML = hidden ? '<span class="eye">◉</span> Ocultar saldo' : '<span class="eye">◌</span> Mostrar saldo'; event.currentTarget.setAttribute('aria-pressed', String(!hidden)); });
document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => { toast.textContent = button.dataset.toast; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); }));
