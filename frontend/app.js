const API_URL = 'http://localhost:3000';

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  questionInput.value = '';
  sendBtn.disabled = true;

  const typingEl = addTypingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    removeTypingIndicator(typingEl);

    const text = extractText(data);
    addMessage(text, 'bot');
  } catch (err) {
    removeTypingIndicator(typingEl);
    addMessage(`Error: ${err.message}`, 'error');
  } finally {
    sendBtn.disabled = false;
    questionInput.focus();
  }
});

function extractText(data) {
  // El backend responde con { data: { respuesta: "..." } }
  if (data?.data?.respuesta) {
    return data.data.respuesta;
  }

  // Fallback: intentar extraer cualquier texto útil
  if (data?.data?.error) {
    return `Error: ${data.data.error}`;
  }

  // Si la respuesta es un objeto, mostrarlo formateado
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }

  return String(data);
}

function addMessage(text, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = type === 'user' ? '👤' : type === 'error' ? '⚠️' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);

  scrollToBottom();
}

function addTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';

  bubble.appendChild(typing);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);

  scrollToBottom();
  return messageDiv;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enfocar el input al cargar
questionInput.focus();
