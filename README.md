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
├── data/                    # Local data files
├── models/
│   └── Contact.js           # Mongoose Contact Schema & Virtuals
├── public/                  # Frontend static assets
│   ├── css/
│   │   └── styles.css       # App styling & CSS variables
│   ├── js/
│   │   └── app.js           # Frontend interactive controller & API fetches
│   └── index.html           # Main Single Page Application (SPA) view
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI workflow
├── .env                     # Local environment config (git-ignored)
├── .env.example             # Template for required environment variables
├── .gitignore               # Ignored files (node_modules, .env, etc.)
├── db.js                    # MongoDB connection & initial sample data seeder
├── package.json             # NPM package dependencies & scripts
├── render.yaml              # Render platform deployment config
├── server.js                # Main Express REST API server entrypoint
├── vercel.json              # Vercel serverless deployment config
└── README.md                # Project documentation
```

---

## ⚙️ Prerequisites

Before running the project locally or deploying, ensure you have:

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

## ☁️ Deployment Guide

### Option 1: Deploy on Render (Recommended)

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following details:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/contact_management?retryWrites=true&w=majority`)
6. Click **Create Web Service**.

---

### Option 2: Deploy on Vercel

1. Push your repository to **GitHub**.
2. Import the project into [Vercel](https://vercel.com/).
3. Add environment variable `MONGODB_URI` under **Settings > Environment Variables**.
4. Deploy! Vercel will automatically use `vercel.json` and build the serverless app.

---

## 📡 API Reference

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
