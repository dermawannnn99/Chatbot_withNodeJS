## AI Chatbot (Manray Assistant)

Full-stack chatbot application dengan backend Node.js (Express) dan frontend HTML/CSS/JS, terintegrasi dengan Google Gemini API.

## 🎯 Fitur Utama
- ✅ UI dark mode dengan sidebar (daftar sesi di kiri, percakapan di kanan)
- ✅ Chat bubble modern dengan avatar user/assistant dan timestamp
- ✅ Status koneksi backend (Connected / Offline)
- ✅ Typing indicator dan loading bubble saat bot menjawab
- ✅ Suggestion chips (quick prompts) untuk mempercepat input
- ✅ Backend proxy untuk menyembunyikan API key Gemini
- ✅ Auto-reconnect jika backend disconnect
- ✅ Responsive design (desktop & mobile)

---

## 📋 Prasyarat
Sebelum menjalankan, pastikan:

- **Node.js v16+** sudah terinstal ([download di sini](https://nodejs.org))
- **Gemini API Key** (gratis dari [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey))
- **Git** (opsional, jika clone via terminal)

---

## 🚀 Cara Clone & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO
```

Ganti `USERNAME` dan `NAMA-REPO` sesuai akun GitHub kamu.

---

### 2. Setup Backend

```bash
cd backend
npm install
```

**Buat file `.env`:**

Salin dari `.env.example` yang sudah ada:

```bash
cp .env.example .env
```

**Edit `.env`:**

Buka file `backend/.env` di text editor (VS Code, Notepad++, dll) dan isi:

```env
PORT=5000
GEMINI_API_KEY=AIzaSyC_PASTE_API_KEY_KAMU_DI_SINI
NODE_ENV=development
```

Ganti `AIzaSyC_...` dengan API key dari [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

**Jalankan Backend:**

```bash
npm start
```

**Output harusnya:**
```
Backend berjalan di http://localhost:5000
API endpoint: POST http://localhost:5000/api/chat
Health check: GET http://localhost:5000/api/health
```

---

### 3. Setup Frontend

Buka terminal **baru** (jangan tutup terminal backend):

```bash
cd frontend
```

**Pilih salah satu cara menjalankan:**

#### **Opsi A: Live Server (VS Code) - RECOMMENDED**

1. Buka folder project di VS Code
2. Klik kanan `frontend/index.html` → **"Open with Live Server"**
3. Browser otomatis buka di `http://127.0.0.1:5500/frontend/index.html`

#### **Opsi B: Python HTTP Server**

```bash
python -m http.server 5500
```

Buka browser: `http://localhost:5500/index.html`

#### **Opsi C: Node http-server**

```bash
npx http-server -p 5500
```

Buka browser: `http://localhost:5500/frontend/index.html`

---

### 4. Mulai Chat

1. Lihat sidebar kiri, status harusnya **"Connected"** (hijau)
2. Jika masih "Offline", tunggu 3 detik (auto-retry)
3. Ketik pesan di input bawah, tekan **Enter** atau klik **Send**
4. Bot akan merespons dalam 2-3 detik

---

## 📁 Struktur Folder

```text
chatbot-project/
├── backend/
│   ├── server.js           # Express server (API: /health, /chat)
│   ├── package.json        # Dependencies & npm start script
│   ├── .env.example        # Template environment (copy jadi .env)
│   ├── .env                # API key (JANGAN commit ke Git)
│   └── node_modules/       # Dependencies terinstal
│
├── frontend/
│   ├── index.html          # Layout UI sidebar + chat
│   ├── style.css           # Styling dark mode
│   └── script.js           # Frontend logic
│
├── .gitignore              # Mengabaikan .env, node_modules
└── README.md               # File ini
```

---

## 🔧 API Endpoints

**Backend menjalankan 2 endpoint:**

### GET `/api/health`
Cek status backend

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "Backend is running ✅"
}
```

### POST `/api/chat`
Kirim pesan ke Gemini AI

**Request:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, explain what is Node.js"}'
```

**Response:**
```json
{
  "message": "Node.js is a JavaScript runtime...",
  "usage": {
    "inputTokens": 15,
    "outputTokens": 120
  }
}
```

---

## ⚙️ Troubleshooting

### ❌ Status "Backend Offline"

**Solusi:**

1. Pastikan backend berjalan di terminal
   ```bash
   cd backend
   npm start
   ```

2. Pastikan frontend dibuka via `http://` bukan `file://`
   - ❌ `file:///D:/chatbot/index.html`
   - ✅ `http://localhost:5500/index.html`

3. Refresh browser (Ctrl+F5)

---

### ❌ Error "Your API key was reported as leaked"

**Solusi:**

1. Buka [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Generate API key **baru**
3. Update `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSyC_NEW_KEY_DISINI
   ```
4. Restart backend (`npm start`)

---

### ❌ "Cannot find module express"

**Solusi:**

```bash
cd backend
npm install
```

---

### ❌ Port 5000 sudah terpakai

**Solusi:**

Edit `backend/.env`:

```env
PORT=5001  # Ganti ke port lain yang tidak terpakai
```

Restart backend.

---

## 🛡️ Security Tips

- ✅ **Jangan** commit `.env` ke GitHub (sudah ada di `.gitignore`)
- ✅ **Jangan** share API key di public
- ✅ Kalau API key bocor, segera generate key baru
- ✅ Frontend tidak boleh akses API key langsung (pakai backend proxy)

---

## 📝 Kontribusi

Pull request dan issue sangat diterima!

Bidang yang bisa diimprove:

- Chat history persistence (localStorage / database)
- User authentication
- Multiple AI models support
- Dark/Light mode toggle
- File upload feature
- Rate limiting

---

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi/komersial

---

## 👤 Author

Muhammad Rizky Dermawan - github.com/dermawannnn99

---

**⭐ Jika project ini helpful, beri star ya!**ding README (2).md…]()
