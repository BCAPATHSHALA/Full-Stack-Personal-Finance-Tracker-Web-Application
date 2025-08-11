# Personal Finance Tracker Application

A simple and intuitive personal finance tracker that helps you monitor your expenses and income effortlessly. Gain insights through detailed reports and analysis to better manage your finances.

## Features

- Track expenses and income seamlessly
- View your current balance
- Browse all your transactions
- Add, edit, and delete transactions
- Sort, filter, and search transactions for easy navigation
- Detailed financial analysis and reports
- Export transactions to CSV (coming soon)
- Import transactions from CSV (coming soon)

## Installation

Clone the repository using HTTPS or SSH:

```bash
# Using HTTPS
git clone https://github.com/BCAPATHSHALA/Full-Stack-Personal-Finance-Tracker-Web-Application.git

# Or using SSH
git clone git@github.com:BCAPATHSHALA/Full-Stack-Personal-Finance-Tracker-Web-Application.git
```

The project contains two main folders:

- `backend` – Backend server code
- `frontend` – Frontend client code

## Backend Setup

```bash
cd backend
npm install
```

## Frontend Setup

```bash
cd frontend
npm install
```

## Running Redis with Docker

Before running the Redis container, ensure Docker is installed and running on your system:
[Docker Installation Guide](https://docs.docker.com/desktop/setup/install/windows-install/)

Start the Redis Stack container (includes RedisInsight UI):

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

OR (if you don't want to use Redis Insight):

```bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```

## Database Setup

Create a **PostgreSQL** database using [NEON](https://neon.tech/) and obtain your connection string.

Create a `.env` file in the root directory of the backend folder with the following environment variables:

```bash
PORT=3000

DATABASE_URL="your_neon_postgresql_connection_url"

REDIS_URL="redis://localhost:6379"

JWT_SECRET="your_jwt_secret_key"

NODE_ENV="development" # or "production"

CLIENT_URL="http://localhost:5173" # or your frontend URL
```

Note: `NODE_ENV="development"` for local development and `NODE_ENV="production"` for production.

## Running the Application

1. Start the backend server:

```bash
npm run dev
```

2. Then start the frontend server (ensure backend is running first):

```bash
npm run dev
```

Access the frontend at: [http://localhost:5173](http://localhost:5173)

## Deployment Links

- [Backend Api (Render)](https://full-stack-personal-finance-tracker-web.onrender.com)
- [Frontend App (Vercel)](https://full-stack-personal-finance-tracker-one.vercel.app)

## API Documentation

Coming soon
