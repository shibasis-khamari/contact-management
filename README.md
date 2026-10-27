# 📇 ContactHub — Contact Management Application

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6%2B-yellow?logo=javascript)
![License](https://img.shields.io/badge/License-ISC-purple)

A modern, responsive full-stack Contact Management Application built with Node.js, Express, MongoDB (Mongoose), and HTML5/CSS3/Vanilla JS. 

Features an intuitive single-page interface with search, category filtering, favorites starring, list/grid views, export to JSON/CSV, and live contact stats overview.

---

## ✨ Features

- 🔍 **Real-time Live Search**: Instantly search contacts by name, email, phone number, or notes.
- 🏷️ **Category Organization**: Filter contacts by `Personal`, `Work`, `Family`, or `Other`.
- ⭐ **Star Favorites**: Easily pin & filter favorite contacts.
- 🔀 **Sorting Options**: Sort by Name (A-Z / Z-A) or Date Added (Newest / Oldest).
- 🗂️ **Grid & List Views**: Dynamic view toggle between visual cards and compact table views.
- 📥 **Export Contacts**: Export contacts in **JSON** or **CSV** format.
- 📊 **Live Stats**: Dynamic dashboard stats tracking total contacts and category distribution.
- 📱 **Fully Responsive UI**: Mobile-friendly layout using CSS grid & flexbox.

---

## 📁 Repository Structure

```text
contact-management/
├── css/
│   └── styles.css           # App styling & CSS variables
├── js/
│   └── app.js               # Frontend interactive controller & API fetches
├── index.html               # Main website entry point (served directly on GitHub Pages)
├── .nojekyll                # Disables Jekyll processing for clean GitHub Pages hosting
├── public/                  # Static assets directory for local Express server
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── models/
│   └── Contact.js           # Mongoose Contact Schema & Virtuals
├── .github/
│   └── workflows/
│       ├── ci.yml           # GitHub Actions CI workflow
│       └── github-pages.yml # GitHub Actions workflow for Pages deployment
├── .env                     # Local environment config (git-ignored)
├── .env.example             # Template for required environment variables
├── .gitignore               # Ignored files (node_modules, .env, etc.)
├── db.js                    # MongoDB connection & initial sample data seeder
├── package.json             # NPM package dependencies & scripts
├── server.js                # Main Express REST API server entrypoint
└── README.md                # Project documentation
```

---

## ⚙️ Prerequisites

Before running the project locally, ensure you have:

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (installed with Node.js)
- [MongoDB](https://www.mongodb.com/) running locally **OR** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cloud cluster.

---

## 🚀 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/contact-management.git
   cd contact-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your settings:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/contact_management
   ```

4. **Start the server:**

   - **Production mode:**
     ```bash
     npm start
     ```
   - **Development mode (with auto-reload):**
     ```bash
     npm run dev
     ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🌐 Hosting on GitHub Pages

The repository is structured so that when hosted on GitHub Pages, the website opens directly at your GitHub Pages link (no README file opened).

### Steps to Host on GitHub Pages:

1. Push your changes to your **GitHub** repository:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages hosting and clean up unwanted deployment files"
   git push origin main
   ```

2. Go to your repository on GitHub.
3. Click on **Settings** (top navigation tab) > **Pages** (under "Code and automation" in the left sidebar).
4. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch** (default)
   - **Branch**: Select `main` (or `master`) and folder `/(root)`
   - Click **Save**.
5. Wait about 30–60 seconds for GitHub Pages to complete.
6. Open your GitHub Pages link (`https://<username>.github.io/<repo-name>/`) — the ContactHub website will load directly!

*(Note: The static site on GitHub Pages runs fully in the browser and safely stores your contacts in your browser's Local Storage, including full search, category filters, and CSV/JSON export.)*

---

## 📡 API Reference (For local Express / MongoDB server)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/contacts` | Retrieve all contacts (supports `search`, `category`, `favorite`, `sort` query params) |
| `GET` | `/api/contacts/stats` | Retrieve overview statistics (total contacts, favorites, category breakdown) |
| `GET` | `/api/contacts/:id` | Get contact details by ID |
| `POST` | `/api/contacts` | Create a new contact |
| `PUT` | `/api/contacts/:id` | Update an existing contact by ID |
| `PATCH` | `/api/contacts/:id/favorite` | Toggle favorite status for a contact |
| `DELETE` | `/api/contacts/:id` | Delete contact by ID |
| `GET` | `/api/contacts/export?format=csv` | Export contacts as CSV file |
| `GET` | `/api/contacts/export?format=json` | Export contacts as JSON file |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
