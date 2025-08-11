# Personal Finance Tracker Application

This is a personal finance tracker application that allows you to track your expenses and income. It is a simple and easy to use application that is perfect for people who want to track their expenses and income. Check analysis and reports to get a better understanding of your finances.

## Features

- Track your expenses and income
- View your balance
- View your transactions
- Add new transactions
- Delete transactions
- Edit transactions
- Sort transactions
- Filter transactions
- Search transactions
- Check analysis and reports
- Export transactions to CSV (coming soon)
- Import transactions from CSV (coming soon)

## Installation

First, clone the repository through HTTPS or SSH:

```bash
git clone https://github.com/BCAPATHSHALA/Full-Stack-Personal-Finance-Tracker-Web-Application.git
```

OR

```bash
git clone git@github.com:BCAPATHSHALA/Full-Stack-Personal-Finance-Tracker-Web-Application.git
```

We have two folders:

- backend: contains the backend code
- frontend: contains the frontend code

To install the backend, run the following command:

```bash
cd backend
npm install
```

To install the frontend, run the following command:

```bash
cd frontend
npm install
```

## Install Docker in your system before running the redis container

Install [Docker](https://docs.docker.com/desktop/setup/install/windows-install/) Ensure Docker Desktop (for Windows/macOS) or Docker Engine (for Linux) is installed and running on your system.

Run the Redis Stack container with Redis Insight and Server:

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

OR (if you don't want to use Redis Insight):

```bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```

Create the [NEON](https://neon.tech/) database and get the connection string for PostgreSQL:

Setup the `.env` file in the backend folder:

```bash
PORT=3000

DATABASE_URL="postgresql_url_from_neon"

REDIS_URL="redis://localhost:6379"
JWT_SECRET="jwt_secret_key"

NODE_ENV="development" or "production"

CLIENT_URL="http://localhost:your_frontend_port"
```

Note: `NODE_ENV="development"` for local development and `NODE_ENV="production"` for production.

Run the backend:

```bash
npm run dev
```

---

Note: If you want to use the frontend, you need to run the backend first.

Run the frontend:

```bash
npm run dev
```

Visit the frontend at [http://localhost:5173](http://localhost:5173)

## API Documentation (Comming soon)
