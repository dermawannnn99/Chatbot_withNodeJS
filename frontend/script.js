const BACKEND_URL = 'http://localhost:5000';
let isBackendReady = false;

// Ignore browser extension errors
window.addEventListener('error', (e) => {
    if (e.message.includes('chrome-extension') || 
        e.message.includes('runtime.lastError')) {
        e.preventDefault();
        return;
    }
});

// Check backend saat load
window.addEventListener('load', () => {
    checkBackend();
});

// Auto-resize textarea
const userInputEl = document.getElementById('userInput');
if (userInputEl) {
    userInputEl.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    });

    // Enter to send (Shift+Enter = new line)
    userInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Check koneksi backend
async function checkBackend() {
    const statusEl = document.getElementById('statusIndicator');
    if (!statusEl) return;
    
    statusEl.textContent = 'Connecting...';
    statusEl.className = 'status-indicator status-loading';

    try {
        console.log('🔍 Checking backend at:', BACKEND_URL);
        
        const response = await fetch(`${BACKEND_URL}/api/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            isBackendReady = true;
            statusEl.textContent = '✓ Backend Connected';
            statusEl.className = 'status-indicator status-online';
            
            // Tampilkan input area, sembunyikan setup
            document.getElementById('setupPrompt').style.display = 'none';
            document.getElementById('inputArea').style.display = 'flex';
            document.getElementById('userInput').focus();

            addMessage('bot', 'Backend berhasil terhubung! Sekarang kita bisa mulai chat. 🎉');
        } else {
            throw new Error('Backend response not OK');
        }
    } catch (error) {
        isBackendReady = false;
        statusEl.textContent = '✗ Backend Offline';
        statusEl.className = 'status-indicator status-offline';
        console.error('❌ Backend error:', error);
        
        // Retry setelah 3 detik
        setTimeout(() => {
            console.log('🔄 Retrying connection...');
            checkBackend();
        }, 3000);
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;
    if (!isBackendReady) {
        alert('Backend belum terhubung. Silahkan tunggu atau refresh halaman.');
        return;
    }

    // Add user message
    addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    // Show loading
    const loadingId = addLoadingMessage();

    // Send to backend
    callBackendAPI(message, loadingId);
}

async function callBackendAPI(message, loadingId) {
    try {
        console.log('📤 Sending message to backend:', message);
        
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 Response data:', data);

        // Remove loading message
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();

        // Handle error
        if (!response.ok) {
            const errorMsg = data.error || 'Terjadi kesalahan';
            addMessage('bot', `❌ Error: ${errorMsg}`, true);
            console.error('API Error:', errorMsg);
            return;
        }

        // Add bot response
        if (data.message) {
            addMessage('bot', data.message);
        } else {
            addMessage('bot', 'Tidak ada respons dari backend');
        }

    } catch (error) {
        // Remove loading message
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();

        console.error('❌ Network Error:', error);
        addMessage('bot', `❌ Network Error: ${error.message}`, true);
    }
}

function addMessage(role, content, isError = false) {
    const chatBox = document.getElementById('chatBox');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}${isError ? ' error' : ''}`;
    messageEl.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addLoadingMessage() {
    const chatBox = document.getElementById('chatBox');
    const messageEl = document.createElement('div');
    const id = 'msg-' + Date.now();
    messageEl.id = id;
    messageEl.className = 'message bot loading';
    messageEl.innerHTML = `
        <div class="message-content">
            <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return id;
}

// Escape HTML untuk security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}