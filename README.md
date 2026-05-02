# Sales Analytics Dashboard

A real-time single-page sales analytics dashboard built with React, Node.js, MongoDB, and Socket.io.

---

## Features

- Real-time stock and sales updates via Socket.io WebSockets
- Product list with category toggle filters and search
- Per-product analytics: line graph with X/Y axes, forecast zone, trend badge
- Week / Month / Year forecast toggle (graph + table)
- Overall tab: combined multi-line chart, revenue by category, aggregated forecast
- Revenue trend arrows (↑↓) per product based on month-over-month change
- Upload new products dynamically via modal form
- Simulate sale button for prototype testing

---

## Prerequisites

- Node.js v18+
- MongoDB (local install or MongoDB Atlas)
- npm

---

## Setup Instructions

### 1. Clone or extract the project

```
sales-dashboard/
├── backend/
└── frontend/
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Copy the environment file and fill in your MongoDB URI:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/sales_dashboard
PORT=5000
```

### 3. Seed the Database

This creates 3 sample products and 6 months of historical sales data:

```bash
npm run seed
```

You should see:
```
MongoDB connected
Cleared existing data
Categories seeded
Products seeded: [ 'Wireless Headphones', 'Bluetooth Speaker', 'Phone Case' ]
Seeded X sales records across 6 months
✅ Database seeded successfully!
```

### 4. Start the Backend

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

---

### 5. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Using the Dashboard

1. Open `http://localhost:5173` in your browser
2. The sidebar shows 3 seeded products grouped by category
3. Click a product to view its analytics dashboard
4. Use **Week / Month / Year** buttons to switch forecast view
5. Click **⚡ Simulate Sale** to trigger a real-time sale — watch stock count drop and graphs update live
6. Click **+ Upload Product** to add a new product dynamically
7. Use the **category toggle pills** to filter the product list
8. Switch to the **Overall** tab to see all products combined

---

## Project Structure

```
sales-dashboard/
├── backend/
│   ├── server.js              # Express + Socket.io server
│   ├── seed.js                # Database seeder
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── products.js        # Product CRUD + analytics
│   │   ├── sales.js           # Sales + simulate endpoint
│   │   ├── forecast.js        # Forecast logic
│   │   └── categories.js
│   └── sockets/
│       └── salesSocket.js     # Socket.io event handlers
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Root component
        ├── api.js              # Axios API calls
        ├── main.jsx
        ├── index.css
        ├── hooks/
        │   └── useSocket.js    # Socket.io React hook
        └── components/
            ├── Sidebar.jsx
            ├── ProductAnalytics.jsx
            ├── OverallAnalytics.jsx
            ├── SalesChart.jsx
            ├── ForecastTable.jsx
            ├── MetricCard.jsx
            ├── TrendBadge.jsx
            └── UploadProductModal.jsx
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| Build tool | Vite |

---

## Color Palette

- Primary orange: `#FF6B35`
- Blue accent: `#4A90E2`
