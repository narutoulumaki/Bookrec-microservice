# Book Recommendation Microservice

A production-grade microservice for book recommendations built with **Spring Boot**, **PostgreSQL**, and **Docker**.

## 🚀 features
- **User Authentication**: JWT-based Signup/Login.
- **Book Metadata**: CRUD operations and Search.
- **Interactions**: Liking and Rating books.
- **Recommendation Engine**: Suggests books based on user's favorite genres.

## 🛠 Tech Stack
- **Java 17**
- **Spring Boot 3**
- **Spring Data JPA (Hibernate)**
- **Spring Security (JWT)**
- **PostgreSQL**
- **Docker & Docker Compose**

## 🏃‍♂️ How to Run

### Prerequisite
- Docker Desktop installed.

### Steps
1. Clone the repo.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. The app will be available at `http://localhost:8080`.

## 🔌 API Endpoints

### Auth
- `POST /auth/signup` - Body: `{"name":"A", "email":"a@b.com", "password":"123"}`
- `POST /auth/login` - Body: `{"email":"a@b.com", "password":"123"}` -> Returns Token

### Books
- `POST /books/add` - Add a book.
- `GET /books/search?title=...` - Search books.

### Interactions
- `POST /interactions/add` - Like/Rate a book.

### Recommendations
- `GET /recommendations/top` - Get your personalized list.

---
*Built for Interview Preparation*
