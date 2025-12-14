# BookRec - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack Deep Dive](#3-technology-stack-deep-dive)
4. [Project Structure](#4-project-structure)
5. [Database Design](#5-database-design)
6. [Security Implementation](#6-security-implementation)
7. [API Documentation](#7-api-documentation)
8. [Service Layer](#8-service-layer)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Docker Configuration](#10-docker-configuration)
11. [Configuration Management](#11-configuration-management)
12. [Error Handling](#12-error-handling)
13. [Testing Strategies](#13-testing-strategies)
14. [Deployment Guide](#14-deployment-guide)
15. [Performance Considerations](#15-performance-considerations)
16. [Future Enhancements](#16-future-enhancements)

---

## 1. Project Overview

### 1.1 What is BookRec?
BookRec is a full-stack **Book Recommendation Microservice** that allows users to:
- Create accounts and authenticate using JWT tokens
- Add, search, and browse books
- Like and rate books
- Receive personalized book recommendations based on their reading preferences

### 1.2 Business Logic
The recommendation engine works by:
1. Tracking user interactions (likes and ratings)
2. Identifying the user's preferred genres based on liked books
3. Suggesting other books in those genres that the user hasn't interacted with yet

### 1.3 Key Design Decisions
| Decision | Rationale |
|----------|-----------|
| Stateless JWT Authentication | Scalability - no server-side session storage needed |
| PostgreSQL | ACID compliance, complex queries for recommendations |
| Docker Compose | Easy local development and deployment |
| Single JAR deployment | Simplified deployment model |
| Static frontend | No additional frontend server needed |

---

## 2. Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   Web Browser   │  │   Postman/curl  │  │  Mobile Apps   │  │
│  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘  │
└───────────┼─────────────────────┼──────────────────┼────────────┘
            │                     │                  │
            ▼                     ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Spring Security Filter Chain               │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │           JWT Authentication Filter              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │AuthController│ │BookController│ │InteractionCtl│ │RecomCtl│ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───┬────┘ │
└─────────┼────────────────┼────────────────┼─────────────┼───────┘
          │                │                │             │
          ▼                ▼                ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ AuthService  │ │ BookService  │ │InteractionSvc│ │RecomSvc│ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───┬────┘ │
└─────────┼────────────────┼────────────────┼─────────────┼───────┘
          │                │                │             │
          ▼                ▼                ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│
│  │UserRepository│ │BookRepository│ │  InteractionRepository   ││
│  └──────┬───────┘ └──────┬───────┘ └────────────┬─────────────┘│
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 PostgreSQL (Port 5432)                  │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐ │   │
│  │  │  users  │  │  books  │  │      interactions       │ │   │
│  │  └─────────┘  └─────────┘  └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow
```
1. Client sends HTTP request
         │
         ▼
2. Spring Security Filter Chain intercepts
         │
         ├── Is it /auth/** or static resource?
         │         │
         │         YES → Allow through (no token needed)
         │
         NO → JWT Authentication Filter
                   │
                   ├── Extract Bearer token from header
                   ├── Validate token signature
                   ├── Check token expiration
                   ├── Set SecurityContext
                   │
                   ▼
3. Controller receives request
         │
         ▼
4. Service executes business logic
         │
         ▼
5. Repository interacts with database
         │
         ▼
6. Response returned to client
```

### 2.3 Layer Responsibilities

| Layer | Responsibility | Spring Annotation |
|-------|---------------|-------------------|
| Controller | HTTP handling, request/response mapping | `@RestController` |
| Service | Business logic, transaction management | `@Service` |
| Repository | Data access, CRUD operations | `@Repository` |
| Security | Authentication, authorization | `@Configuration` |
| Model | Data representation | `@Entity` |

---

## 3. Technology Stack Deep Dive

### 3.1 Java 17
**Why Java 17?**
- Long-Term Support (LTS) release
- Enhanced performance with new garbage collectors
- Pattern matching, records, sealed classes
- Required by Spring Boot 3.x

**Key Features Used:**
```java
// Records (could be used for DTOs)
public record LoginRequest(String email, String password) {}

// Text blocks for SQL queries
String query = """
    SELECT * FROM books 
    WHERE genre = ?
    """;
```

### 3.2 Spring Boot 3.2.0
**Core Dependencies:**
```xml
<!-- Web Starter: REST APIs, Embedded Tomcat -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Data JPA: ORM with Hibernate -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Security: Authentication/Authorization -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**Auto-Configuration Benefits:**
- Embedded Tomcat server (no external server needed)
- DataSource auto-configuration from properties
- JPA/Hibernate auto-configuration
- Security filter chain auto-setup

### 3.3 Spring Data JPA
**How it Works:**
```java
// Just declare an interface
public interface BookRepository extends JpaRepository<Book, UUID> {
    // Spring automatically implements this method!
    List<Book> findByTitleContainingIgnoreCase(String title);
}

// Behind the scenes, Spring generates:
// SELECT * FROM books WHERE LOWER(title) LIKE LOWER('%' || ? || '%')
```

**Query Derivation Keywords:**
| Keyword | Sample | Generated SQL |
|---------|--------|---------------|
| `findBy` | `findByEmail` | `WHERE email = ?` |
| `Containing` | `findByTitleContaining` | `WHERE title LIKE %?%` |
| `IgnoreCase` | `findByTitleIgnoreCase` | `WHERE LOWER(title) = LOWER(?)` |
| `OrderBy` | `findByGenreOrderByTitle` | `ORDER BY title` |

### 3.4 Spring Security
**Security Filter Chain:**
```
Request → CsrfFilter → LogoutFilter → JwtAuthenticationFilter 
        → UsernamePasswordAuthenticationFilter → ExceptionTranslationFilter 
        → FilterSecurityInterceptor → Controller
```

**Configuration Explained:**
```java
http
    .csrf(csrf -> csrf.disable())  // Disabled for REST API (stateless)
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**").permitAll()  // Public endpoints
        .anyRequest().authenticated()              // Everything else needs auth
    )
    .sessionManagement(sess -> 
        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // No sessions
    )
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
```

### 3.5 JWT (JSON Web Tokens)
**Token Structure:**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGVtYWlsLmNvbSIsImlhdCI6MTcwMjU2NzIwMCwiZXhwIjoxNzAyNjUzNjAwfQ.signature
│                    │                                                                      │
└── HEADER ──────────┘                                                                      │
    (algorithm)                                                                             │
                     └── PAYLOAD ─────────────────────────────────────────────────────────┘│
                         (sub: subject/email, iat: issued at, exp: expiration)              │
                                                                                            │
                                                              └── SIGNATURE ────────────────┘
                                                                  (HMAC-SHA256 of header.payload)
```

**Token Lifecycle:**
```
1. User logs in with email/password
         │
         ▼
2. Server validates credentials
         │
         ▼
3. Server generates JWT with:
   - Subject (email)
   - Issued At (current time)
   - Expiration (current + 24 hours)
   - Signature (using secret key)
         │
         ▼
4. Client stores token (localStorage)
         │
         ▼
5. Client sends token in every request:
   Authorization: Bearer <token>
         │
         ▼
6. Server validates token on each request
```

### 3.6 PostgreSQL
**Why PostgreSQL?**
- ACID compliant (Atomicity, Consistency, Isolation, Durability)
- Advanced query capabilities
- JSON support (for future features)
- Excellent performance with proper indexing

**Connection Configuration:**
```properties
spring.datasource.url=jdbc:postgresql://db:5432/bookrec
spring.datasource.username=postgres
spring.datasource.password=pass
spring.jpa.hibernate.ddl-auto=update  # Auto-create/update tables
```

### 3.7 Lombok
**Annotations Used:**
```java
@Data           // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // Generates no-args constructor
@AllArgsConstructor // Generates all-args constructor
@Builder        // Generates builder pattern
```

**Before Lombok:**
```java
public class Book {
    private UUID id;
    private String title;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    // ... 50 more lines
}
```

**After Lombok:**
```java
@Data
public class Book {
    private UUID id;
    private String title;
}
```

---

## 4. Project Structure

```
bookrec/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── bookrec/
│       │           ├── BookRecApplication.java      # Entry point
│       │           ├── controller/                  # REST endpoints
│       │           │   ├── AuthController.java
│       │           │   ├── BookController.java
│       │           │   ├── InteractionController.java
│       │           │   └── RecommendationController.java
│       │           ├── model/                       # JPA entities
│       │           │   ├── Book.java
│       │           │   ├── Interaction.java
│       │           │   └── User.java
│       │           ├── repository/                  # Data access
│       │           │   ├── BookRepository.java
│       │           │   ├── InteractionRepository.java
│       │           │   └── UserRepository.java
│       │           ├── service/                     # Business logic
│       │           │   ├── AuthService.java
│       │           │   ├── BookService.java
│       │           │   ├── InteractionService.java
│       │           │   └── RecommendationService.java
│       │           └── security/                    # Security config
│       │               ├── JwtAuthenticationFilter.java
│       │               ├── JwtUtil.java
│       │               └── SecurityConfig.java
│       └── resources/
│           ├── application.properties               # Configuration
│           └── static/                              # Frontend files
│               ├── index.html
│               ├── css/
│               │   └── style.css
│               └── js/
│                   └── app.js
├── docker-compose.yml                               # Docker orchestration
├── Dockerfile                                       # Build instructions
├── pom.xml                                          # Maven dependencies
└── README.md                                        # Documentation
```

### 4.1 Package Responsibilities

| Package | Files | Purpose |
|---------|-------|---------|
| `controller` | 4 | Handle HTTP requests, validate input, return responses |
| `service` | 4 | Business logic, orchestrate repositories |
| `repository` | 3 | Database queries, CRUD operations |
| `model` | 3 | JPA entities, database table mappings |
| `security` | 3 | JWT handling, security configuration |

---

## 5. Database Design

### 5.1 Entity-Relationship Diagram
```
┌─────────────────────┐       ┌─────────────────────┐
│       USERS         │       │       BOOKS         │
├─────────────────────┤       ├─────────────────────┤
│ id (UUID) [PK]      │       │ id (UUID) [PK]      │
│ name (VARCHAR)      │       │ title (VARCHAR)     │
│ email (VARCHAR) [U] │       │ author (VARCHAR)    │
│ password (VARCHAR)  │       │ genre (VARCHAR)     │
└──────────┬──────────┘       └──────────┬──────────┘
           │                             │
           │         ┌───────────────────┘
           │         │
           ▼         ▼
┌─────────────────────────────────────────┐
│            INTERACTIONS                 │
├─────────────────────────────────────────┤
│ id (UUID) [PK]                          │
│ user_id (UUID) [FK → users.id]          │
│ book_id (UUID) [FK → books.id]          │
│ liked (BOOLEAN)                         │
│ rating (INTEGER) [1-5]                  │
└─────────────────────────────────────────┘
```

### 5.2 Table Definitions

**users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL  -- BCrypt hashed
);
```

**books**
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL
);
```

**interactions**
```sql
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    book_id UUID REFERENCES books(id),
    liked BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
```

### 5.3 JPA Entity Mappings

**Book Entity:**
```java
@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String author;
    
    @Column(nullable = false)
    private String genre;
}
```

**Annotation Breakdown:**
| Annotation | Purpose |
|------------|---------|
| `@Entity` | Marks class as JPA entity |
| `@Table(name = "books")` | Specifies table name |
| `@Id` | Primary key field |
| `@GeneratedValue(strategy = GenerationType.UUID)` | Auto-generate UUID |
| `@Column(nullable = false)` | NOT NULL constraint |

### 5.4 Indexing Strategy
```sql
-- Recommended indexes for performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_book ON interactions(book_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

## 6. Security Implementation

### 6.1 Password Hashing
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Usage in AuthService
String hashedPassword = passwordEncoder.encode(rawPassword);  // Signup
boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);  // Login
```

**BCrypt Features:**
- Adaptive: Work factor can be increased as hardware improves
- Salt built-in: Each hash includes a random salt
- One-way: Cannot reverse the hash to get the password

**Example Hash:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBwBx7MJeJbKvJqHfRXWQAuMzgF6
│  │  │                      │
│  │  │                      └── Hash (31 chars)
│  │  └── Salt (22 chars)
│  └── Cost factor (2^10 = 1024 iterations)
└── Algorithm identifier (2a = BCrypt)
```

### 6.2 JWT Implementation

**JwtUtil.java - Key Methods:**
```java
// Generate token after successful login
public String generateToken(String username) {
    return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))  // 24h
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
}

// Validate token on each request
public Boolean validateToken(String token, String username) {
    final String extractedUsername = extractUsername(token);
    return (extractedUsername.equals(username) && !isTokenExpired(token));
}
```

### 6.3 JWT Authentication Filter

**JwtAuthenticationFilter.java - Flow:**
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) {
    
    // 1. Extract token from header
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
        String jwt = header.substring(7);
        
        // 2. Extract username from token
        String username = jwtUtil.extractUsername(jwt);
        
        // 3. Validate and set authentication
        if (username != null && jwtUtil.validateToken(jwt, username)) {
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
    
    // 4. Continue filter chain
    filterChain.doFilter(request, response);
}
```

### 6.4 Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless REST API)
            .csrf(csrf -> csrf.disable())
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/", "/index.html", "/css/**", "/js/**").permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            
            // Stateless session (no server-side session)
            .sessionManagement(sess -> 
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Add JWT filter before default authentication filter
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 6.5 Security Best Practices Implemented

| Practice | Implementation |
|----------|---------------|
| Password Hashing | BCrypt with cost factor 10 |
| Stateless Auth | JWT tokens, no server sessions |
| Token Expiration | 24-hour expiry |
| HTTPS Ready | Configure in production |
| CORS | Can be added for cross-origin requests |

---

## 7. API Documentation

### 7.1 Authentication Endpoints

#### POST /auth/signup
**Description:** Create a new user account

**Request:**
```http
POST /auth/signup HTTP/1.1
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Response (Success - 200):**
```
User registered successfully
```

**Response (Error - 400):**
```
Email already exists
```

---

#### POST /auth/login
**Description:** Authenticate and receive JWT token

**Request:**
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAyNTY3MjAwLCJleHAiOjE3MDI2NTM2MDB9.abc123"
}
```

**Response (Error - 401):**
```
Invalid credentials
```

---

### 7.2 Book Endpoints

#### POST /books/add
**Description:** Add a new book (requires authentication)

**Request:**
```http
POST /books/add HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic"
}
```

**Response (Success - 200):**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic"
}
```

---

#### GET /books/search
**Description:** Search books by title

**Request:**
```http
GET /books/search?title=gatsby HTTP/1.1
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "Classic"
    }
]
```

---

#### GET /books/all
**Description:** Get all books

**Request:**
```http
GET /books/all HTTP/1.1
Authorization: Bearer <token>
```

---

#### GET /books/genre/{genre}
**Description:** Get books by genre

**Request:**
```http
GET /books/genre/Fiction HTTP/1.1
Authorization: Bearer <token>
```

---

### 7.3 Interaction Endpoints

#### POST /interactions/add
**Description:** Like or rate a book

**Request (Like):**
```http
POST /interactions/add HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
    "bookId": "550e8400-e29b-41d4-a716-446655440000",
    "liked": true
}
```

**Request (Rate):**
```http
POST /interactions/add HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
    "bookId": "550e8400-e29b-41d4-a716-446655440000",
    "rating": 5
}
```

**Response (Success - 200):**
```json
{
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "770e8400-e29b-41d4-a716-446655440002",
    "bookId": "550e8400-e29b-41d4-a716-446655440000",
    "liked": true,
    "rating": 5
}
```

---

### 7.4 Recommendation Endpoints

#### GET /recommendations/top
**Description:** Get personalized book recommendations

**Request:**
```http
GET /recommendations/top HTTP/1.1
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
    {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "genre": "Classic"
    },
    {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "title": "1984",
        "author": "George Orwell",
        "genre": "Classic"
    }
]
```

---

### 7.5 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created (could use for signup) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Token valid but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

---

## 8. Service Layer

### 8.1 AuthService
```java
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public String signup(User user) {
        // Check if email exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Save user
        userRepository.save(user);
        
        return "User registered successfully";
    }
    
    public String login(String email, String password) {
        // Find user
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Generate and return token
        return jwtUtil.generateToken(email);
    }
}
```

### 8.2 BookService
```java
@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }
    
    public List<Book> searchBooks(String title) {
        if (title == null || title.isEmpty()) {
            return bookRepository.findAll();
        }
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<Book> getBooksByGenre(String genre) {
        return bookRepository.findByGenreIgnoreCase(genre);
    }
    
    public Optional<Book> getBookById(UUID id) {
        return bookRepository.findById(id);
    }
    
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
}
```

### 8.3 RecommendationService
```java
@Service
public class RecommendationService {
    
    @Autowired
    private InteractionRepository interactionRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Book> getRecommendations(String email) {
        // 1. Find user
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 2. Get user's liked books
        List<Interaction> likedInteractions = interactionRepository
            .findByUserIdAndLikedTrue(user.getId());
        
        // 3. Extract favorite genres
        Set<String> favoriteGenres = likedInteractions.stream()
            .map(i -> i.getBook().getGenre())
            .collect(Collectors.toSet());
        
        // 4. Get books user has already interacted with
        Set<UUID> interactedBookIds = interactionRepository
            .findByUserId(user.getId()).stream()
            .map(i -> i.getBook().getId())
            .collect(Collectors.toSet());
        
        // 5. Find books in favorite genres that user hasn't seen
        return bookRepository.findAll().stream()
            .filter(book -> favoriteGenres.contains(book.getGenre()))
            .filter(book -> !interactedBookIds.contains(book.getId()))
            .limit(10)
            .collect(Collectors.toList());
    }
}
```

---

## 9. Frontend Architecture

### 9.1 File Structure
```
static/
├── index.html      # Single-page application
├── css/
│   └── style.css   # All styles
└── js/
    └── app.js      # All JavaScript logic
```

### 9.2 State Management
```javascript
// Global state
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('userEmail');

// State persistence
localStorage.setItem('authToken', token);  // On login
localStorage.removeItem('authToken');       // On logout
```

### 9.3 API Communication
```javascript
// Generic fetch wrapper
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    
    if (response.status === 401 || response.status === 403) {
        handleLogout();  // Token expired
        throw new Error('Session expired');
    }
    
    return response;
}
```

### 9.4 UI Components

**Tab Navigation:**
```javascript
function showDashTab(tabName) {
    const tabs = ['books', 'add-book', 'recommendations'];
    tabs.forEach((tab, index) => {
        const element = document.getElementById(`${tab}-tab`);
        element.classList.toggle('hidden', tab !== tabName);
    });
}
```

**Book Card Rendering:**
```javascript
function displayBooks(books) {
    container.innerHTML = books.map(book => `
        <div class="book-card">
            <h3>${escapeHtml(book.title)}</h3>
            <p class="author">by ${escapeHtml(book.author)}</p>
            <span class="genre">${escapeHtml(book.genre)}</span>
            <div class="actions">
                <button onclick="likeBook('${book.id}')">❤️ Like</button>
                <select onchange="rateBook('${book.id}', this.value)">
                    <option value="">Rate</option>
                    <option value="1">⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                </select>
            </div>
        </div>
    `).join('');
}
```

### 9.5 CSS Architecture

**Design System:**
```css
/* Colors */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--text-dark: #333;
--text-light: #666;
--background: #f8f9fa;
--white: #fff;

/* Spacing */
--spacing-sm: 10px;
--spacing-md: 20px;
--spacing-lg: 30px;

/* Border Radius */
--radius-sm: 10px;
--radius-md: 15px;
--radius-lg: 20px;
--radius-full: 25px;
```

---

## 10. Docker Configuration

### 10.1 Dockerfile (Multi-stage Build)
```dockerfile
# Stage 1: Build
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/bookrec-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Multi-stage Build Benefits:**
| Stage | Image Size | Contains |
|-------|------------|----------|
| Build | ~800MB | Maven, JDK, source code, dependencies |
| Run | ~250MB | JRE, final JAR only |

### 10.2 Docker Compose
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: bookrec
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persist data

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/bookrec
    depends_on:
      - db  # Wait for database to start

volumes:
  postgres_data:  # Named volume for persistence
```

### 10.3 Docker Commands Reference
```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild single service
docker-compose up --build app

# Execute command in container
docker-compose exec app sh

# Check running containers
docker-compose ps
```

---

## 11. Configuration Management

### 11.1 application.properties
```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://db:5432/bookrec
spring.datasource.username=postgres
spring.datasource.password=pass

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=ThisIsAVerySecretKeyForMyBookRecommendationMicroservice12345
jwt.expiration=86400000
```

### 11.2 Configuration Properties Explained

| Property | Value | Description |
|----------|-------|-------------|
| `server.port` | 8080 | HTTP port |
| `ddl-auto=update` | update | Auto-update schema (dev only) |
| `show-sql=true` | true | Log SQL queries (debugging) |
| `jwt.expiration` | 86400000 | Token validity (24h in ms) |

### 11.3 Environment-Specific Configuration

**Development (application-dev.properties):**
```properties
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
logging.level.org.springframework.security=DEBUG
```

**Production (application-prod.properties):**
```properties
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
logging.level.org.springframework.security=WARN
jwt.secret=${JWT_SECRET}  # From environment variable
```

---

## 12. Error Handling

### 12.1 Current Implementation
```java
// In controllers - basic exception handling
@GetMapping("/{id}")
public Book getBook(@PathVariable UUID id) {
    return bookService.getBookById(id)
        .orElseThrow(() -> new RuntimeException("Book not found"));
}
```

### 12.2 Recommended: Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}

@Data
@AllArgsConstructor
class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
```

---

## 13. Testing Strategies

### 13.1 Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class BookServiceTest {
    
    @Mock
    private BookRepository bookRepository;
    
    @InjectMocks
    private BookService bookService;
    
    @Test
    void searchBooks_WithTitle_ReturnsMatchingBooks() {
        // Arrange
        List<Book> expectedBooks = List.of(
            new Book(UUID.randomUUID(), "Gatsby", "Fitzgerald", "Classic")
        );
        when(bookRepository.findByTitleContainingIgnoreCase("gatsby"))
            .thenReturn(expectedBooks);
        
        // Act
        List<Book> result = bookService.searchBooks("gatsby");
        
        // Assert
        assertEquals(1, result.size());
        assertEquals("Gatsby", result.get(0).getTitle());
    }
}
```

### 13.2 Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class BookControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Test
    void addBook_WithValidToken_ReturnsCreatedBook() throws Exception {
        String token = jwtUtil.generateToken("test@example.com");
        
        mockMvc.perform(post("/books/add")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\",\"author\":\"Author\",\"genre\":\"Fiction\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Test"));
    }
}
```

### 13.3 Test Coverage Goals
| Layer | Target Coverage |
|-------|-----------------|
| Service | 80%+ |
| Repository | 70%+ (queries) |
| Controller | 70%+ |
| Security | 90%+ |

---

## 14. Deployment Guide

### 14.1 Local Development
```bash
# Start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Access app
open http://localhost:8080
```

### 14.2 Production Deployment Checklist

- [ ] Change `jwt.secret` to strong random value
- [ ] Set `ddl-auto=validate` (not update)
- [ ] Configure HTTPS/TLS
- [ ] Set up proper logging
- [ ] Configure database connection pooling
- [ ] Set up health checks
- [ ] Configure rate limiting
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure backup strategy

### 14.3 Cloud Deployment Options

**AWS:**
- ECS/Fargate for containers
- RDS for PostgreSQL
- ALB for load balancing

**Azure:**
- Azure Container Apps
- Azure Database for PostgreSQL
- Azure Front Door

**Google Cloud:**
- Cloud Run
- Cloud SQL
- Cloud Load Balancing

---

## 15. Performance Considerations

### 15.1 Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_interactions_user ON interactions(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM books WHERE title ILIKE '%gatsby%';
```

### 15.2 Caching Strategy
```java
// Add caching for frequently accessed data
@Cacheable("books")
public List<Book> getAllBooks() {
    return bookRepository.findAll();
}

@CacheEvict(value = "books", allEntries = true)
public Book addBook(Book book) {
    return bookRepository.save(book);
}
```

### 15.3 Connection Pooling
```properties
# HikariCP settings (default in Spring Boot)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
```

---

## 16. Future Enhancements

### 16.1 Planned Features
| Feature | Priority | Complexity |
|---------|----------|------------|
| User profiles | High | Medium |
| Book reviews/comments | High | Medium |
| Advanced search filters | Medium | Low |
| Reading lists | Medium | Medium |
| Social features (follow users) | Low | High |
| ML-based recommendations | Low | High |

### 16.2 Technical Improvements
- [ ] Add request validation (Bean Validation)
- [ ] Implement pagination for book lists
- [ ] Add API versioning
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement audit logging

### 16.3 Architecture Evolution
```
Current: Monolith
    │
    ▼
Phase 1: Add Redis caching
    │
    ▼
Phase 2: Extract recommendation service
    │
    ▼
Phase 3: Event-driven architecture (Kafka)
    │
    ▼
Phase 4: Full microservices
```

---

## Appendix A: Common Commands

```bash
# Docker
docker-compose up --build -d    # Start
docker-compose down             # Stop
docker-compose logs -f app      # View logs
docker-compose exec db psql -U postgres -d bookrec  # DB shell

# Maven
mvn clean package               # Build JAR
mvn test                        # Run tests
mvn spring-boot:run            # Run locally

# Database
psql -h localhost -U postgres -d bookrec
\dt                            # List tables
\d+ books                      # Describe table
SELECT * FROM users;           # Query
```

---

## Appendix B: Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | DB not ready | Wait 15s after docker-compose up |
| "Session expired" on login | JWT filter missing | Ensure JwtAuthenticationFilter is registered |
| "401 Unauthorized" | Invalid/expired token | Login again to get new token |
| Schema not created | ddl-auto setting | Set to `update` for development |
| Port already in use | Previous instance running | `docker-compose down` first |

---

*Last Updated: December 2024*
*Version: 1.0.0*
