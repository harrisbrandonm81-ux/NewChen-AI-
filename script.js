const chat = document.querySelector('#chat');
const chatForm = document.querySelector('#chatForm');
const messageInput = document.querySelector('#messageInput');
const sendBtn = document.querySelector('#sendBtn');
const clearChatBtn = document.querySelector('#clearChatBtn');
const settingsBtn = document.querySelector('#settingsBtn');
const settingsDialog = document.querySelector('#settingsDialog');
const displayNameInput = document.querySelector('#displayNameInput');
const apiKeyInput = document.querySelector('#apiKeyInput');
const modelInput = document.querySelector('#modelInput');
const saveSettingsBtn = document.querySelector('#saveSettingsBtn');

const STORAGE_KEY = 'newchen-ai-settings';
let settings = {
  displayName: 'You',
  apiKey: '',
  model: 'gpt-4o-mini',
};

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    settings = {
      ...settings,
      ...parsed,
    };
  } catch {
    // Ignore bad local data and keep defaults.
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function addMessage(role, text) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  article.appendChild(paragraph);
  chat.appendChild(article);
  chat.scrollTop = chat.scrollHeight;
  return article;
}

function findLocalAnswer(question) {
  const normalized = question.trim().toLowerCase();
  const localFaq = {
    'what are you': 'I am NewChen AI.',
  };

  return localFaq[normalized] || null;
}

async function askOpenAI(question) {
  if (!settings.apiKey) {
    return 'No local answer found. Add your OpenAI API key in Settings to use ChatGPT.';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are NewChen AI. Be concise, accurate, and helpful.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return `OpenAI request failed (${response.status}). ${errorText.slice(0, 180)}`;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response content returned by OpenAI.';
}

async function handleQuestion(text) {
  addMessage('user', `${settings.displayName}: ${text}`);

  sendBtn.disabled = true;
  const pendingNode = addMessage('bot', 'Thinking...');

  try {
    const localAnswer = findLocalAnswer(text);
    const answer = localAnswer || (await askOpenAI(text));
    pendingNode.querySelector('p').textContent = answer;
  } catch (error) {
    pendingNode.querySelector('p').textContent = `Unexpected error: ${error.message}`;
  } finally {
    sendBtn.disabled = false;
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  messageInput.value = '';
  await handleQuestion(text);
});

clearChatBtn.addEventListener('click', () => {
  chat.innerHTML = '';
  addMessage('bot', 'Chat cleared. Ask your next question.');
});

settingsBtn.addEventListener('click', () => {
  displayNameInput.value = settings.displayName;
  apiKeyInput.value = settings.apiKey;
  modelInput.value = settings.model;
  settingsDialog.showModal();
});

saveSettingsBtn.addEventListener('click', (event) => {
  event.preventDefault();
  settings.displayName = displayNameInput.value.trim() || 'You';
  settings.apiKey = apiKeyInput.value.trim();
  settings.model = modelInput.value.trim() || 'gpt-4o-mini';
  saveSettings();
  addMessage('bot', 'Settings saved.');
  settingsDialog.close();
});

loadSettings();
