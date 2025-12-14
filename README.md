# Book Recommendation Microservice

A production-grade microservice for book recommendations built with **Spring Boot**, **PostgreSQL**, and **Docker** — complete with a web UI.

## 🚀 Features
- **User Authentication**: JWT-based Signup/Login
- **Book Management**: Add, search, and browse books
- **Interactions**: Like and rate books (1-5 stars)
- **Recommendation Engine**: Get personalized book suggestions based on your favorite genres
- **Web UI**: Modern, responsive interface to interact with all features

## 🛠 Tech Stack
- **Java 17**
- **Spring Boot 3**
- **Spring Data JPA (Hibernate)**
- **Spring Security (JWT)**
- **PostgreSQL**
- **Docker & Docker Compose**
- **HTML/CSS/JavaScript** (Frontend)

---

## 🏃‍♂️ Quick Start Guide

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Step 1: Clone and Start
```bash
git clone <repository-url>
cd bookrec
docker-compose up --build -d
```

### Step 2: Open the App
Open your browser and go to: **http://localhost:8080**

### Step 3: Create an Account
1. Click the **Sign Up** tab
2. Enter your name, email, and password
3. Click **Sign Up**

### Step 4: Login
1. Switch to the **Login** tab
2. Enter your email and password
3. Click **Login**

### Step 5: Start Using the App
Once logged in, you'll see the dashboard with three tabs:

| Tab | What You Can Do |
|-----|-----------------|
| 📖 **Books** | Search and browse all books. Like or rate them to train your recommendations. |
| ➕ **Add Book** | Add new books with title, author, and genre. |
| ⭐ **Recommendations** | Get personalized book suggestions based on genres you've liked! |

---

## 📖 How Recommendations Work

1. **Add some books** to the system (or use existing ones)
2. **Like books** you enjoy by clicking the ❤️ button
3. **Rate books** using the dropdown (1-5 stars)
4. Go to the **Recommendations** tab and click "Get Recommendations"
5. The system analyzes your liked genres and suggests similar books!

---

## 🔌 API Reference

All API endpoints (except auth) require a JWT token in the header:
```
Authorization: Bearer <your-token>
```

### Authentication
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Create account | `{"name":"...", "email":"...", "password":"..."}` |
| POST | `/auth/login` | Get JWT token | `{"email":"...", "password":"..."}` |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/books/add` | Add a new book |
| GET | `/books/search?title=...` | Search books by title |
| GET | `/books/all` | Get all books |
| GET | `/books/genre/{genre}` | Get books by genre |

### Interactions
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/interactions/add` | Like or rate a book | `{"bookId":"...", "liked":true, "rating":5}` |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/top` | Get personalized recommendations |

---

## 🛑 Stopping the App

```bash
docker-compose down
```

To also remove the database data:
```bash
docker-compose down -v
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Session expired" after login | Make sure you're using the latest build: `docker-compose down && docker-compose up --build -d` |
| Page not loading | Wait 15-20 seconds after starting for the app to initialize |
| Database connection errors | Ensure Docker Desktop is running and ports 5432/8080 are free |

---

*Built for Interview Preparation*
