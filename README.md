# Roots-Routes
# 🌿 Roots & Routes — Travel & Tour Guide Platform

> *Connecting curious minds to extraordinary places.*

A full-stack travel and tour guide platform that combines a mobile-responsive Bootstrap frontend with a Python/Flask backend, Firebase for auth and data persistence, and a BeautifulSoup-powered data pipeline for scraping travel content from the web.

---

## 📸 Preview

```
┌─────────────────────────────────────────────┐
│  Roots & Routes                  [Sign In]  │
├─────────────────────────────────────────────┤
│                                             │
│   Every Journey                             │
│   Tells a Story.          [Santorini ♥]     │
│                           [Rajasthan ♥]     │
│   [ Where do you want to go? ] [Explore]    │
│   🏖 Beach  🏔 Mountain  🏛 Heritage        │
│                                             │
├─────────────────────────────────────────────┤
│  2,400+ Destinations · 18,000 Travelers     │
└─────────────────────────────────────────────┘
```

---

## 🚀 Features

- **Destination Discovery** — Browse and filter 2,400+ curated destinations by category, budget, and rating
- **Tour Packages** — Explore guided tour packages with pricing, group size, and difficulty info
- **Smart Search** — Real-time search with URL query param support and live filtering
- **Wishlist System** — Save favorite destinations to a personal wishlist (Firebase-backed)
- **User Authentication** — Email/password and Google OAuth via Firebase Auth
- **Newsletter Subscriptions** — Email capture stored in Firestore
- **BeautifulSoup Scraper** — Automated pipeline to scrape destination info from Wikipedia and travel blogs
- **Admin Scrape API** — Authenticated endpoint to trigger scrape jobs and push to Firestore
- **Animated UI** — Scroll-triggered animations, floating cards, counter effects, and micro-interactions
- **Mobile Responsive** — Bootstrap 5 grid with custom breakpoints for all screen sizes
- **Cross-browser Compatible** — Tested across Chrome, Firefox, Safari, and Edge

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| CSS Framework | Bootstrap 5.3 |
| Icons & Fonts | Font Awesome 6, Google Fonts (Playfair Display, DM Sans, Bebas Neue) |
| Backend | Python 3.11+, Flask 3.0 |
| Database | Firebase Firestore |
| Authentication | Firebase Auth (Email + Google OAuth) |
| Web Scraping | BeautifulSoup4, Requests, lxml |
| Deployment | Gunicorn (production WSGI server) |

---

## 📁 Project Structure

```
roots-and-routes/
│
├── backend/
│   ├── app.py              # Flask app — routes, API endpoints, Firebase integration
│   └── scraper.py          # Standalone BeautifulSoup scraper + Firebase data pipeline
│
├── static/
│   ├── css/
│   │   └── style.css       # Full design system — variables, components, animations
│   ├── js/
│   │   ├── firebase-config.js   # Firebase init, auth helpers, Firestore helpers
│   │   ├── app.js               # Core UI logic, mock data, interactions, counters
│   │   └── destinations.js      # Filter, search, and render for destinations page
│   └── images/             # Static image assets
│
├── templates/
│   ├── index.html          # Homepage — hero, destinations, tours, testimonials
│   ├── destinations.html   # Filterable destinations listing page
│   ├── login.html          # Sign-in page (email + Google)
│   └── register.html       # Registration page with password strength meter
│
├── data/                   # Local JSON output from scraper runs
├── requirements.txt        # Python dependencies
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- Python 3.11+
- pip
- A Firebase project ([create one free](https://console.firebase.google.com))
- Node.js (optional, for local tooling)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/roots-and-routes.git
cd roots-and-routes
```

### 2. Set Up a Virtual Environment

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Firebase

**a. Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)

**b. Enable services:**
- Authentication → Sign-in methods → Email/Password + Google
- Firestore Database → Start in test mode

**c. Download your service account key:**
- Project Settings → Service Accounts → Generate new private key
- Save as `serviceAccountKey.json` in the project root (never commit this file)

**d. Update frontend config** in `static/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**e. Add Firebase SDK scripts** to your HTML templates (before `</body>`):

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

### 5. Set Environment Variables

Create a `.env` file in the project root:

```env
FLASK_ENV=development
FIREBASE_CRED=serviceAccountKey.json
ADMIN_KEY=your-secret-admin-key
PORT=5000
```

### 6. Run the Development Server

```bash
cd backend
python app.py
```

Visit `http://localhost:5000` — the app is live.

---

## 🕷️ BeautifulSoup Scraper

The scraper pipeline is a standalone tool that pulls travel data from Wikipedia and arbitrary travel blog URLs, then pushes structured results into Firestore.

### Scrape Destination Info (Wikipedia)

```bash
python backend/scraper.py --destinations "Santorini,Bali,Kyoto,Patagonia"
```

### Scrape a Travel Article URL

```bash
python backend/scraper.py --url "https://www.lonelyplanet.com/articles/best-places-to-visit"
```

### Seed Firebase with Initial Data

```bash
python backend/scraper.py --seed
```

### Run Without Firebase (local JSON output only)

```bash
python backend/scraper.py --destinations "Maldives,Queenstown" --no-firebase
# Output saved to data/*.json
```

### Trigger via Admin API

```bash
curl -X POST http://localhost:5000/api/admin/scrape \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-secret-admin-key" \
  -d '{"destinations": ["Santorini", "Bali"]}'
```

---

## 🔌 API Reference

All endpoints return JSON in the shape `{ success, timestamp, data }`.

### Destinations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/destinations` | List destinations (supports `?category=beach&sort=rating&limit=12&q=japan`) |
| `GET` | `/api/destinations/:id` | Get single destination by ID |

### Tours

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tours` | List all tour packages |

### Newsletter

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/newsletter/subscribe` | `{ "email": "..." }` | Subscribe an email |

### Wishlist

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/wishlist?uid=USER_ID` | Get a user's wishlist |
| `POST` | `/api/wishlist` | Add destination to wishlist |
| `DELETE` | `/api/wishlist` | Remove destination from wishlist |

### Admin (requires `X-Admin-Key` header)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/scrape` | Trigger scrape pipeline |
| `GET` | `/api/scrape/destination-info?name=Santorini` | Scrape single destination info |
| `GET` | `/api/health` | Server and Firebase status |

---

## 🗃️ Firestore Collections

```
firestore/
├── users/
│   └── {uid}
│       ├── name, email, photoURL
│       ├── wishlist: [destId, ...]
│       ├── bookings: [...]
│       └── createdAt
│
├── destinations/
│   └── {id}
│       ├── name, category, country
│       ├── rating, price, duration
│       └── description
│
├── tours/
│   └── {id}
│       ├── name, duration, price
│       ├── groupSize, difficulty, badge
│       └── popularity
│
├── newsletter/
│   └── {auto-id}
│       ├── email
│       └── subscribed_at
│
├── scraped_destinations/
│   └── {destination_name}
│       ├── summary, infobox, images
│       └── scraped_at
│
└── blog_posts/
    └── {title_slug}
        ├── title, description, image
        ├── excerpt, paragraphs, keywords
        └── scraped_at
```

---

## 🚢 Deployment

### Production with Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
```

### Deploy to Railway / Render / Fly.io

1. Set all environment variables in your platform dashboard
2. Set start command to: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app`
3. Upload `serviceAccountKey.json` as a secret file or use a `FIREBASE_CRED_JSON` env var

### Deploy Frontend to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🔧 Git Push — Step by Step

### First-time Setup

```bash
# Initialize repo (if not already done)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Firebase
serviceAccountKey.json
.env

# Python
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
dist/
build/

# Data output
data/*.json

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# Stage and commit
git add .
git commit -m "feat: initial project setup — Roots & Routes v1.0"

# Add remote and push
git remote add origin https://github.com/your-username/roots-and-routes.git
git branch -M main
git push -u origin main
```

### Ongoing Workflow

```bash
# Pull latest changes
git pull origin main

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes, then stage and commit
git add .
git commit -m "feat: add booking confirmation page"

# Push branch and open PR
git push origin feat/your-feature-name
```

### Recommended Commit Message Prefixes

| Prefix | Use for |
|---|---|
| `feat:` | New feature or page |
| `fix:` | Bug fix |
| `style:` | CSS or UI changes |
| `refactor:` | Code restructuring |
| `data:` | Scraper or Firebase data changes |
| `docs:` | README or documentation updates |
| `chore:` | Dependency updates, config changes |

---

## 🔐 Security Notes

- **Never commit** `serviceAccountKey.json` or `.env` to version control
- The `/api/admin/scrape` endpoint is protected by `X-Admin-Key` — rotate this key regularly
- Firebase security rules should be configured before going to production:

```javascript
// firestore.rules — recommended starting point
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /destinations/{id} {
      allow read: if true;
      allow write: if false; // admin only via backend
    }
    match /newsletter/{id} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/soumya1712)
- LinkedIn: [Soumya Ranjan Panda](www.linkedin.com/in/soumya-ranjan-panda-09037b317)

---

*Built with Python 🐍, Firebase 🔥, BeautifulSoup 🍜, and Bootstrap 💙*
