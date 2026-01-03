const BACKEND_URL = 'http://localhost:5000';
let isBackendReady = false;

// Ignore browser extension errors
window.addEventListener('error', (e) => {
    if (
        e.message.includes('chrome-extension') ||
        e.message.includes('runtime.lastError')
    ) {
        e.preventDefault();
        return;
    }
});

// Check backend saat load
window.addEventListener('load', () => {
    console.log('Page loaded, setting up UI...');
    setupUIEvents();
    checkBackend();
});

// Setup UI events (chips, button, Enter)
function setupUIEvents() {
    const userInputEl = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestionContainer = document.getElementById('suggestions');
    const newChatBtn = document.getElementById('newChatBtn');

    if (userInputEl) {
        userInputEl.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });

        userInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (suggestionContainer) {
        suggestionContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.suggestion-chip');
            if (!btn) return;

            const text = btn.getAttribute('data-text') || btn.innerText;
            const input = document.getElementById('userInput');
            if (!input) return;

            input.value = text;
            input.dispatchEvent(new Event('input'));
            sendMessage();
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            const chatBox = document.getElementById('chatBox');
            if (!chatBox) return;

            chatBox.innerHTML = '';
            addMessage('bot', 'New session started. What would you like to talk about?');
        });
    }
}

// Check koneksi backend
async function checkBackend() {
    const statusEl = document.getElementById('statusIndicator');
    if (!statusEl) {
        console.error('Status indicator element not found');
        return;
    }

    statusEl.textContent = 'Connecting...';
    statusEl.className = 'status-indicator status-loading';

    console.log('Checking backend at:', BACKEND_URL);

    try {
        const response = await fetch(`${BACKEND_URL}/api/health`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            isBackendReady = true;
            statusEl.textContent = 'Connected';
            statusEl.className = 'status-indicator status-online';

            addMessage('bot', 'Backend connected successfully. I am Manray Assistant, ready to help you!');
        } else {
            throw new Error('Backend response not OK');
        }
    } catch (error) {
        isBackendReady = false;
        statusEl.textContent = 'Offline';
        statusEl.className = 'status-indicator status-offline';
        console.error('Backend error:', error);

        // Retry setelah 3 detik
        setTimeout(() => {
            console.log('Retrying connection...');
            checkBackend();
        }, 3000);
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    if (!input) {
        console.error('Input element not found');
        return;
    }

    const message = input.value.trim();
    if (!message) return;

    if (!isBackendReady) {
        alert('Backend is not connected. Please wait or refresh the page.');
        return;
    }

    // Add user message
    addMessage('user', message);
    input.value = '';
    if (input.style) {
        input.style.height = 'auto';
    }

    // Show typing indicator + loading bubble
    const loadingId = addLoadingMessage();
    toggleTyping(true);

    // Send to backend
    callBackendAPI(message, loadingId);
}

async function callBackendAPI(message, loadingId) {
    try {
        console.log('Sending message to backend:', message);

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        // Remove loading message + typing
        removeMessageById(loadingId);
        toggleTyping(false);

        if (!response.ok) {
            const errorMsg = data.error || 'An error occurred';
            addMessage('bot', `Error: ${errorMsg}`, true);
            console.error('API Error:', errorMsg);
            return;
        }

        if (data.message) {
            // Simulate typing delay for better UX
            await simulateTyping(500);
            addMessage('bot', data.message);
        } else {
            addMessage('bot', 'No response from backend.');
        }
    } catch (error) {
        removeMessageById(loadingId);
        toggleTyping(false);

        console.error('Network Error:', error);
        addMessage('bot', `Network Error: ${error.message}`, true);
    }
}

function addMessage(role, content, isError = false) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) {
        console.error('Chat box element not found');
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}${isError ? ' error' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${role === 'user' ? 'user-avatar' : 'bot-avatar'}`;
    avatar.textContent = role === 'user' ? 'U' : 'M';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const textEl = document.createElement('div');
    textEl.className = 'bubble-text';
    textEl.innerHTML = escapeHtml(content);

    const meta = document.createElement('div');
    meta.className = 'meta';

    const roleLabel = document.createElement('span');
    roleLabel.className = 'role-label';
    roleLabel.textContent = role === 'user' ? 'You' : 'Manray';

    const timeLabel = document.createElement('span');
    timeLabel.textContent = getTimeString();

    meta.appendChild(roleLabel);
    meta.appendChild(timeLabel);

    bubble.appendChild(textEl);
    bubble.appendChild(meta);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

function addLoadingMessage() {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return null;

    const id = 'msg-' + Date.now();

    const wrapper = document.createElement('div');
    wrapper.className = 'message bot loading';
    wrapper.id = id;

    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.textContent = 'M';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const textEl = document.createElement('div');
    textEl.className = 'bubble-text';

    const dots = document.createElement('div');
    dots.className = 'loading-dots';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'typing-dot';
        dots.appendChild(dot);
    }

    textEl.appendChild(dots);
    bubble.appendChild(textEl);
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    return id;
}

function removeMessageById(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

function toggleTyping(show) {
    const el = document.getElementById('typingIndicator');
    if (!el) return;

    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function simulateTyping(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getTimeString() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML untuk security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}