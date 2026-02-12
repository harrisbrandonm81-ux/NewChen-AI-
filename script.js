const chat = document.querySelector('#chat');
const chatForm = document.querySelector('#chatForm');
const messageInput = document.querySelector('#messageInput');
const clearChatBtn = document.querySelector('#clearChatBtn');
const settingsBtn = document.querySelector('#settingsBtn');
const settingsDialog = document.querySelector('#settingsDialog');
const displayNameInput = document.querySelector('#displayNameInput');
const saveSettingsBtn = document.querySelector('#saveSettingsBtn');

let displayName = 'You';

function addMessage(role, text) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  article.appendChild(paragraph);
  chat.appendChild(article);
  chat.scrollTop = chat.scrollHeight;
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage('user', `${displayName}: ${text}`);
  addMessage('bot', 'Thanks! This is a demo response from NewChen AI.');
  messageInput.value = '';
});

clearChatBtn.addEventListener('click', () => {
  chat.innerHTML = '';
  addMessage('bot', 'Chat cleared. Start a new conversation!');
});

settingsBtn.addEventListener('click', () => {
  displayNameInput.value = displayName;
  settingsDialog.showModal();
});

saveSettingsBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const nextName = displayNameInput.value.trim();
  if (nextName) {
    displayName = nextName;
    addMessage('bot', `Settings saved. I will call you ${displayName}.`);
  }
  settingsDialog.close();
});
