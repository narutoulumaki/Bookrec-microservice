# 100 Interview Questions - BookRec Project

A comprehensive list of interview questions covering all aspects of this Book Recommendation Microservice project. Questions range from basic to advanced, covering Java, Spring Boot, databases, security, architecture, and system design.

---

## Section 1: Java Fundamentals (1-15)

### Q1. Why did you choose Java 17 for this project?
**Answer:** Java 17 is a Long-Term Support (LTS) release, meaning it receives extended support and security updates. It's required by Spring Boot 3.x and includes performance improvements like enhanced garbage collection, pattern matching, records, and sealed classes.

### Q2. What is the difference between JDK, JRE, and JVM?
**Answer:**
- **JDK (Java Development Kit):** Complete development kit including compiler, debugger, and tools
- **JRE (Java Runtime Environment):** Runtime environment to execute Java programs
- **JVM (Java Virtual Machine):** Abstract machine that executes bytecode, provides platform independence

### Q3. Explain the UUID used for entity IDs. Why not use Long?
**Answer:** UUIDs provide:
- Global uniqueness without a central authority
- No sequential patterns (security benefit)
- Works well in distributed systems
- No collision risk when merging databases
- Trade-off: Larger storage (16 bytes vs 8 bytes for Long)

### Q4. What are the access modifiers in Java and how are they used in this project?
**Answer:**
- `public`: Controllers, services (accessible from anywhere)
- `private`: Entity fields, utility methods
- `protected`: Not commonly used in this project
- Default (package-private): Internal classes

### Q5. Explain how Lombok reduces boilerplate code.
**Answer:** Lombok generates code at compile time:
- `@Data`: Generates getters, setters, toString, equals, hashCode
- `@NoArgsConstructor`: No-args constructor
- `@AllArgsConstructor`: All-args constructor
- Reduces entity class from ~100 lines to ~10 lines

### Q6. What is the difference between == and .equals() in Java?
**Answer:**
- `==`: Compares references (memory addresses)
- `.equals()`: Compares object content
- For UUIDs in this project, always use `.equals()` for comparison

### Q7. How does exception handling work in this project?
**Answer:** Currently uses `RuntimeException` with messages. Better approach:
- Custom exceptions (e.g., `BookNotFoundException`)
- `@RestControllerAdvice` for global handling
- Proper HTTP status codes in responses

### Q8. What is Optional and how is it used in repositories?
**Answer:** `Optional<T>` prevents null pointer exceptions:
```java
Optional<Book> book = bookRepository.findById(id);
book.orElseThrow(() -> new RuntimeException("Not found"));
```

### Q9. Explain the Stream API usage in RecommendationService.
**Answer:**
```java
likedInteractions.stream()
    .map(i -> i.getBook().getGenre())  // Transform to genres
    .collect(Collectors.toSet());       // Collect to Set
```
Streams provide functional-style operations on collections.

### Q10. What is the difference between List, Set, and Map?
**Answer:**
- **List:** Ordered, allows duplicates (used for book lists)
- **Set:** Unordered, no duplicates (used for favorite genres)
- **Map:** Key-value pairs (used for JWT claims)

### Q11. How does garbage collection work in Java?
**Answer:** JVM automatically reclaims memory:
- **Mark and Sweep:** Identifies unreachable objects
- **Generational GC:** Young (Eden, Survivor) and Old generations
- Java 17 has improved G1GC as default collector

### Q12. What are functional interfaces used in this project?
**Answer:**
- `Function<T,R>`: Used in JWT claims extraction
- `Supplier<T>`: For lazy exception creation
- `Consumer<T>`: For forEach operations
- `Predicate<T>`: For stream filtering

### Q13. Explain method references vs lambda expressions.
**Answer:**
```java
// Lambda
.map(interaction -> interaction.getBook())
// Method reference (cleaner)
.map(Interaction::getBook)
```

### Q14. What is the difference between StringBuilder and String?
**Answer:**
- **String:** Immutable (new object for each modification)
- **StringBuilder:** Mutable (efficient for multiple modifications)
- Use StringBuilder for building JWT tokens or complex strings

### Q15. How does Java handle dates and times? What's used in JWT?
**Answer:**
- `java.util.Date`: Legacy, used in JWT library
- `java.time.LocalDateTime`: Modern API (Java 8+)
- JWT uses milliseconds since epoch for expiration

---

## Section 2: Spring Boot Fundamentals (16-35)

### Q16. What is Spring Boot and why use it?
**Answer:** Spring Boot is an opinionated framework that:
- Provides auto-configuration
- Embedded server (no external Tomcat needed)
- Starter dependencies (curated compatible versions)
- Production-ready features (health checks, metrics)

### Q17. Explain the @SpringBootApplication annotation.
**Answer:** Combines three annotations:
- `@Configuration`: Java-based configuration
- `@EnableAutoConfiguration`: Auto-configure beans
- `@ComponentScan`: Scan for components in package

### Q18. What is dependency injection and how does Spring implement it?
**Answer:** DI is a design pattern where dependencies are provided rather than created:
- `@Autowired`: Field/constructor injection
- Spring manages bean lifecycle
- Promotes loose coupling, testability

### Q19. What's the difference between @Component, @Service, @Repository, @Controller?
**Answer:** All are `@Component` specializations:
- `@Component`: Generic bean
- `@Service`: Business logic layer
- `@Repository`: Data access layer (adds exception translation)
- `@Controller/@RestController`: Web layer

### Q20. Explain the Spring Bean lifecycle.
**Answer:**
1. Instantiation
2. Populate properties
3. BeanNameAware, BeanFactoryAware
4. Pre-initialization (BeanPostProcessor)
5. InitializingBean / @PostConstruct
6. Post-initialization
7. Bean ready for use
8. DisposableBean / @PreDestroy

### Q21. What is the difference between @RestController and @Controller?
**Answer:**
- `@Controller`: Returns view names (for MVC)
- `@RestController`: Returns data directly (`@Controller` + `@ResponseBody`)
- This project uses `@RestController` for REST APIs

### Q22. How does @RequestMapping work?
**Answer:** Maps HTTP requests to handler methods:
```java
@RestController
@RequestMapping("/books")  // Base path
public class BookController {
    @GetMapping("/search")  // GET /books/search
    @PostMapping("/add")    // POST /books/add
}
```

### Q23. Explain @RequestBody and @ResponseBody.
**Answer:**
- `@RequestBody`: Deserialize JSON request body to Java object
- `@ResponseBody`: Serialize Java object to JSON response
- `@RestController` includes `@ResponseBody` by default

### Q24. What is the difference between @PathVariable and @RequestParam?
**Answer:**
```java
// @PathVariable: Part of URL path
@GetMapping("/books/{id}")  // /books/123
public Book getBook(@PathVariable UUID id)

// @RequestParam: Query parameter
@GetMapping("/search")  // /search?title=gatsby
public List<Book> search(@RequestParam String title)
```

### Q25. How does Spring Boot auto-configuration work?
**Answer:**
- Scans classpath for dependencies
- Reads `spring.factories` files
- Applies `@ConditionalOnClass`, `@ConditionalOnProperty`
- Creates beans if conditions match
- Can be overridden with custom `@Bean` definitions

### Q26. What are Spring Boot Starters?
**Answer:** Pre-packaged dependency descriptors:
- `spring-boot-starter-web`: REST APIs, embedded Tomcat
- `spring-boot-starter-data-jpa`: JPA + Hibernate
- `spring-boot-starter-security`: Spring Security
- Ensures compatible versions

### Q27. Explain the application.properties file.
**Answer:** External configuration:
- Server settings (`server.port`)
- Database connection (`spring.datasource.*`)
- JPA settings (`spring.jpa.*`)
- Custom properties (`jwt.secret`)
- Can be overridden by environment variables

### Q28. What is the difference between application.properties and application.yml?
**Answer:**
- `.properties`: Key-value format, simpler
- `.yml`: Hierarchical, more readable for nested config
- Both are functionally equivalent

### Q29. How do you handle different environments (dev, prod)?
**Answer:**
- `application-dev.properties`, `application-prod.properties`
- Activate with `spring.profiles.active=dev`
- Environment variables override properties
- Docker Compose can set environment variables

### Q30. What is @Value annotation used for?
**Answer:** Inject property values:
```java
@Value("${jwt.expiration}")
private long jwtExpiration;

@Value("${jwt.secret:defaultSecret}")  // With default
private String secret;
```

### Q31. Explain Spring Boot Actuator (if added).
**Answer:** Production-ready features:
- `/actuator/health`: Health check
- `/actuator/metrics`: Application metrics
- `/actuator/info`: Application info
- Useful for monitoring and operations

### Q32. How does embedded Tomcat work?
**Answer:**
- Packaged inside the JAR
- No external server installation needed
- Configured via properties (`server.port`)
- Can be replaced with Jetty or Undertow

### Q33. What is the purpose of @Autowired?
**Answer:** Automatic dependency injection:
- Field injection: `@Autowired private Service service;`
- Constructor injection (preferred): implicit in Spring Boot
- Setter injection: `@Autowired public void setService(Service s)`

### Q34. Explain constructor injection vs field injection.
**Answer:**
```java
// Field injection (not recommended)
@Autowired
private BookService bookService;

// Constructor injection (recommended)
private final BookService bookService;
public BookController(BookService bookService) {
    this.bookService = bookService;
}
```
Constructor injection is preferred for immutability and testability.

### Q35. What happens when Spring Boot application starts?
**Answer:**
1. Load application context
2. Auto-configure beans based on classpath
3. Scan for components
4. Create and wire beans
5. Start embedded server
6. Ready to accept requests

---

## Section 3: Spring Data JPA (36-50)

### Q36. What is JPA and how does Spring Data JPA simplify it?
**Answer:**
- **JPA:** Java Persistence API (specification for ORM)
- **Hibernate:** JPA implementation
- **Spring Data JPA:** Reduces boilerplate with repository interfaces

### Q37. Explain the @Entity annotation.
**Answer:** Marks a class as a JPA entity (database table):
```java
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
```

### Q38. What is the difference between @Entity and @Table?
**Answer:**
- `@Entity`: Required, marks class as entity
- `@Table`: Optional, specifies table name and schema
- If `@Table` is omitted, table name = class name

### Q39. Explain different GenerationType strategies.
**Answer:**
- `AUTO`: JPA picks appropriate strategy
- `IDENTITY`: Database auto-increment
- `SEQUENCE`: Database sequence
- `UUID`: Generate UUID (used in this project)
- `TABLE`: Simulated sequence using a table

### Q40. How does Spring Data JPA query derivation work?
**Answer:** Method names become queries:
```java
// Method name
findByTitleContainingIgnoreCase(String title)

// Generated SQL
SELECT * FROM books WHERE LOWER(title) LIKE LOWER('%' || ? || '%')
```

### Q41. List common query derivation keywords.
**Answer:**
| Keyword | Example | SQL |
|---------|---------|-----|
| `findBy` | `findByEmail` | `WHERE email = ?` |
| `And` | `findByNameAndAge` | `WHERE name = ? AND age = ?` |
| `Or` | `findByNameOrEmail` | `WHERE name = ? OR email = ?` |
| `Between` | `findByAgeBetween` | `WHERE age BETWEEN ? AND ?` |
| `LessThan` | `findByAgeLessThan` | `WHERE age < ?` |
| `OrderBy` | `findByGenreOrderByTitle` | `ORDER BY title` |

### Q42. What is @Query annotation used for?
**Answer:** Custom JPQL or native SQL:
```java
@Query("SELECT b FROM Book b WHERE b.genre = :genre")
List<Book> findBooksByGenre(@Param("genre") String genre);

@Query(value = "SELECT * FROM books WHERE genre = ?1", nativeQuery = true)
List<Book> findBooksNative(String genre);
```

### Q43. Explain the difference between JPQL and native SQL.
**Answer:**
- **JPQL:** Object-oriented, uses entity names and fields
- **Native SQL:** Database-specific, uses table/column names
- JPQL is portable, native SQL for complex/optimized queries

### Q44. What is the N+1 query problem?
**Answer:** When fetching entities with relationships:
```java
List<Interaction> interactions = repo.findAll();  // 1 query
for (Interaction i : interactions) {
    i.getBook().getTitle();  // N additional queries
}
```
Solution: Use `@EntityGraph` or `JOIN FETCH`

### Q45. Explain FetchType.LAZY vs FetchType.EAGER.
**Answer:**
- `LAZY`: Load related entities on demand (default for collections)
- `EAGER`: Load related entities immediately (default for single)
- LAZY is generally preferred for performance

### Q46. What is the difference between save() and saveAndFlush()?
**Answer:**
- `save()`: Persist to persistence context (may batch)
- `saveAndFlush()`: Immediately write to database
- Use `saveAndFlush()` when you need ID immediately

### Q47. How does transaction management work?
**Answer:**
- `@Transactional`: Wraps method in transaction
- Default: Rollback on RuntimeException
- Service layer typically has transactions
- Repository methods are transactional by default

### Q48. Explain spring.jpa.hibernate.ddl-auto options.
**Answer:**
| Option | Behavior | Use Case |
|--------|----------|----------|
| `none` | Do nothing | Production |
| `validate` | Validate schema | Production |
| `update` | Update schema | Development |
| `create` | Drop and create | Testing |
| `create-drop` | Create, drop on shutdown | Testing |

### Q49. What is an EntityManager?
**Answer:** JPA interface for:
- Persisting entities
- Finding entities
- Creating queries
- Managing transactions
- Spring Data JPA abstracts this with repositories

### Q50. How do you handle database migrations in production?
**Answer:**
- **Flyway** or **Liquibase** for versioned migrations
- Never use `ddl-auto=update` in production
- Migration scripts in `db/migration/`
- Tracks applied migrations in database table

---

## Section 4: Spring Security & JWT (51-70)

### Q51. What is Spring Security?
**Answer:** Comprehensive security framework providing:
- Authentication (who are you?)
- Authorization (what can you do?)
- Protection against common attacks (CSRF, XSS)
- Integration with various authentication mechanisms

### Q52. Explain the security filter chain.
**Answer:** Chain of filters processing each request:
1. `CsrfFilter`
2. `LogoutFilter`
3. `JwtAuthenticationFilter` (custom)
4. `UsernamePasswordAuthenticationFilter`
5. `ExceptionTranslationFilter`
6. `FilterSecurityInterceptor`

### Q53. Why is CSRF disabled in this project?
**Answer:**
- CSRF protection is for browser-based form submissions
- REST APIs use tokens, not cookies
- Stateless architecture doesn't need CSRF
- Would break JWT-based authentication

### Q54. What is JWT and why use it?
**Answer:** JSON Web Token:
- Stateless authentication
- Self-contained (includes claims)
- Signed for integrity
- No server-side session storage
- Scales well in distributed systems

### Q55. Explain the three parts of a JWT.
**Answer:**
```
header.payload.signature

Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "user@email.com", "iat": 1702567200, "exp": 1702653600}
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Q56. What is the difference between authentication and authorization?
**Answer:**
- **Authentication:** Verify identity (login)
- **Authorization:** Verify permissions (can access resource?)
- This project: JWT for authentication, permitAll/authenticated for authorization

### Q57. How does the JwtAuthenticationFilter work?
**Answer:**
1. Extract `Authorization` header
2. Remove "Bearer " prefix
3. Extract username from token
4. Validate token signature and expiration
5. Create `Authentication` object
6. Set in `SecurityContextHolder`

### Q58. What is SecurityContextHolder?
**Answer:**
- Thread-local storage for security context
- Holds current `Authentication` object
- Accessible anywhere in the request: `SecurityContextHolder.getContext().getAuthentication()`

### Q59. Explain BCrypt password hashing.
**Answer:**
- One-way hash function
- Includes salt (prevents rainbow tables)
- Configurable cost factor (2^n iterations)
- Same password produces different hashes

### Q60. Why not store plain text passwords?
**Answer:**
- Database breaches expose all passwords
- Users reuse passwords across sites
- Compliance requirements (GDPR, PCI-DSS)
- BCrypt makes brute-force impractical

### Q61. What is the JWT expiration and why is it important?
**Answer:**
- Tokens have limited lifetime (24h in this project)
- Limits damage if token is stolen
- Forces re-authentication periodically
- Balance between security and UX

### Q62. How would you implement refresh tokens?
**Answer:**
- Short-lived access token (15 min)
- Long-lived refresh token (7 days)
- Store refresh tokens in database
- Refresh endpoint issues new access token
- Revoke refresh token on logout

### Q63. What happens if JWT secret is compromised?
**Answer:**
- Attacker can forge valid tokens
- Immediate action: Change secret
- All existing tokens become invalid
- Users must re-authenticate
- Consider using asymmetric keys (RS256)

### Q64. Explain requestMatchers configuration.
**Answer:**
```java
.requestMatchers("/auth/**").permitAll()      // Public
.requestMatchers("/admin/**").hasRole("ADMIN") // Admin only
.anyRequest().authenticated()                  // All others need auth
```

### Q65. What is the difference between hasRole and hasAuthority?
**Answer:**
- `hasRole("ADMIN")`: Checks for `ROLE_ADMIN`
- `hasAuthority("ADMIN")`: Checks for `ADMIN` exactly
- Roles have `ROLE_` prefix by convention

### Q66. How do you get the current user in a controller?
**Answer:**
```java
// Method 1: Principal
@GetMapping("/profile")
public User getProfile(Principal principal) {
    return userService.findByEmail(principal.getName());
}

// Method 2: SecurityContextHolder
String email = SecurityContextHolder.getContext()
    .getAuthentication().getName();
```

### Q67. What is stateless session management?
**Answer:**
```java
.sessionManagement(sess -> 
    sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```
- No server-side sessions
- Each request is independent
- Token contains all needed info
- Better for scalability

### Q68. How would you implement role-based access control?
**Answer:**
1. Add `role` field to User entity
2. Include role in JWT claims
3. Create `UserDetails` implementation
4. Configure authorization rules:
```java
.requestMatchers("/admin/**").hasRole("ADMIN")
```

### Q69. What are common JWT security best practices?
**Answer:**
- Use strong secret (256+ bits)
- Set reasonable expiration
- Use HTTPS only
- Store securely on client
- Validate all claims
- Consider asymmetric signing

### Q70. How would you implement logout with JWT?
**Answer:**
- Client-side: Remove token from storage
- Server-side: Token blacklist in Redis
- Short expiration minimizes impact
- Refresh token revocation in database

---

## Section 5: REST API Design (71-80)

### Q71. What are REST principles?
**Answer:**
- **Stateless:** Each request contains all info
- **Client-Server:** Separation of concerns
- **Uniform Interface:** Standard HTTP methods
- **Layered System:** Client unaware of intermediaries
- **Cacheable:** Responses can be cached

### Q72. Explain HTTP methods used in this project.
**Answer:**
| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve | `/books/search` |
| POST | Create | `/books/add` |
| PUT | Update (full) | `/books/{id}` |
| PATCH | Update (partial) | `/books/{id}` |
| DELETE | Remove | `/books/{id}` |

### Q73. What is the difference between PUT and PATCH?
**Answer:**
- **PUT:** Replace entire resource
- **PATCH:** Partial update
- Example: Updating just book title → PATCH

### Q74. How should REST endpoints be named?
**Answer:**
- Use nouns, not verbs: `/books` not `/getBooks`
- Plural for collections: `/books` not `/book`
- Hierarchical: `/users/{id}/interactions`
- Query params for filtering: `/books?genre=Fiction`

### Q75. What status codes should each endpoint return?
**Answer:**
| Operation | Success | Error |
|-----------|---------|-------|
| GET | 200 OK | 404 Not Found |
| POST | 201 Created | 400 Bad Request |
| PUT/PATCH | 200 OK | 404 Not Found |
| DELETE | 204 No Content | 404 Not Found |

### Q76. How do you handle API versioning?
**Answer:**
- URL: `/api/v1/books`
- Header: `Accept: application/vnd.api.v1+json`
- Query: `/books?version=1`
- URL versioning is most common and visible

### Q77. What is HATEOAS?
**Answer:** Hypermedia As The Engine Of Application State:
```json
{
    "id": 1,
    "title": "Gatsby",
    "_links": {
        "self": {"href": "/books/1"},
        "interactions": {"href": "/books/1/interactions"}
    }
}
```
Clients discover actions through links.

### Q78. How do you implement pagination?
**Answer:**
```java
@GetMapping("/books")
public Page<Book> getBooks(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    return bookRepository.findAll(PageRequest.of(page, size));
}
```

### Q79. What is content negotiation?
**Answer:**
- Client specifies desired format via `Accept` header
- Server responds in appropriate format
- `Accept: application/json` → JSON response
- `Accept: application/xml` → XML response

### Q80. How do you document REST APIs?
**Answer:**
- **OpenAPI/Swagger:** Auto-generate from code
- **Spring Doc:** Annotations for descriptions
- Interactive documentation UI
- Postman collections

---

## Section 6: Docker & Deployment (81-90)

### Q81. What is Docker and why use it?
**Answer:**
- Container platform for consistent environments
- "Works on my machine" → "Works everywhere"
- Lightweight compared to VMs
- Reproducible deployments

### Q82. Explain the Dockerfile in this project.
**Answer:**
```dockerfile
# Stage 1: Build
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Q83. What is multi-stage build?
**Answer:**
- Multiple FROM statements
- Build stage: Large image with build tools
- Run stage: Small image with only runtime
- Reduces final image size (800MB → 250MB)

### Q84. Explain docker-compose.yml structure.
**Answer:**
```yaml
services:
  db:           # Service name
    image:      # Docker image
    environment: # Environment variables
    ports:      # Port mapping
    volumes:    # Data persistence
  app:
    build:      # Build from Dockerfile
    depends_on: # Start order
```

### Q85. What is the difference between docker run and docker-compose up?
**Answer:**
- `docker run`: Single container
- `docker-compose up`: Multiple containers, networking, volumes
- Compose manages entire application stack

### Q86. How do containers communicate in Docker Compose?
**Answer:**
- Automatic DNS resolution by service name
- `db:5432` resolves to database container
- Shared network created automatically
- No need for IP addresses

### Q87. What are Docker volumes used for?
**Answer:**
- Persist data beyond container lifecycle
- `postgres_data:/var/lib/postgresql/data`
- Data survives container restart
- Can be backed up

### Q88. How do you view container logs?
**Answer:**
```bash
docker-compose logs -f app      # Follow logs
docker logs <container_id>      # Specific container
docker-compose logs --tail=100  # Last 100 lines
```

### Q89. What happens when docker-compose down -v is run?
**Answer:**
- Stop all containers
- Remove containers
- Remove networks
- `-v`: Remove volumes (data loss!)
- Useful for clean restart

### Q90. How would you deploy this to production?
**Answer:**
- Build image: `docker build -t bookrec:1.0 .`
- Push to registry: `docker push`
- Pull on server
- Use orchestrator (Kubernetes, ECS)
- Configure secrets management
- Set up load balancer

---

## Section 7: System Design & Architecture (91-100)

### Q91. Explain the layered architecture of this project.
**Answer:**
```
Controller → Service → Repository → Database
```
- **Controller:** HTTP handling
- **Service:** Business logic
- **Repository:** Data access
- Each layer has single responsibility

### Q92. Why separate concerns into layers?
**Answer:**
- Maintainability: Change one layer without affecting others
- Testability: Mock layers independently
- Reusability: Services can be used by multiple controllers
- Clarity: Clear responsibility boundaries

### Q93. How would you scale this application?
**Answer:**
- **Horizontal:** Multiple app instances behind load balancer
- **Database:** Read replicas, connection pooling
- **Caching:** Redis for frequently accessed data
- **Stateless design:** Allows easy scaling

### Q94. What is the single responsibility principle?
**Answer:**
- Each class has one reason to change
- `BookService`: Only book business logic
- `AuthService`: Only authentication logic
- Makes code easier to understand and maintain

### Q95. How does the recommendation algorithm work?
**Answer:**
1. Get user's liked interactions
2. Extract genres from liked books
3. Find books in same genres
4. Exclude already-interacted books
5. Return top results

### Q96. How would you improve the recommendation engine?
**Answer:**
- Collaborative filtering: "Users like you also liked..."
- Content-based: Similar authors, keywords
- Machine learning: Train on interaction data
- Hybrid approach: Combine multiple strategies

### Q97. What would you change for a high-traffic production system?
**Answer:**
- Add Redis caching
- Database indexing and optimization
- Pagination on all list endpoints
- Rate limiting
- CDN for static assets
- Monitoring and alerting

### Q98. How would you implement caching?
**Answer:**
```java
@Cacheable("books")
public List<Book> getAllBooks() {
    return bookRepository.findAll();
}

@CacheEvict(value = "books", allEntries = true)
public Book addBook(Book book) {
    return bookRepository.save(book);
}
```

### Q99. What monitoring would you add?
**Answer:**
- **Health checks:** `/actuator/health`
- **Metrics:** Response times, error rates
- **Logging:** Centralized (ELK stack)
- **Alerting:** PagerDuty/Slack notifications
- **Tracing:** Distributed tracing for debugging

### Q100. If you had to redesign this as microservices, how would you split it?
**Answer:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ User Service│ │ Book Service│ │Recommendation│
│  - Auth     │ │  - CRUD     │ │  Service    │
│  - Profile  │ │  - Search   │ │  - ML Model │
└─────────────┘ └─────────────┘ └─────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
              ┌────────────────┐
              │  API Gateway   │
              └────────────────┘
```
- Separate databases per service
- Event-driven communication (Kafka)
- Service discovery (Eureka/Consul)

---

## Bonus: Behavioral Questions

### B1. What was the most challenging part of this project?
**Sample Answer:** Implementing JWT authentication with Spring Security. Understanding the filter chain and ensuring tokens were properly validated on each request required deep diving into Spring Security internals.

### B2. What would you do differently if starting over?
**Sample Answer:** I would add comprehensive testing from the start, implement proper exception handling with custom exceptions, and set up CI/CD early in the development process.

### B3. How did you debug issues during development?
**Sample Answer:** I used a combination of:
- `docker-compose logs` for container output
- `spring.jpa.show-sql=true` for database queries
- Postman for API testing
- Browser DevTools for frontend debugging

### B4. How do you stay updated with Java/Spring ecosystem?
**Sample Answer:** I follow Spring Blog, subscribe to Java Weekly newsletter, participate in Stack Overflow, and experiment with new features in side projects.

### B5. Describe a time you had to learn something new quickly.
**Sample Answer:** When implementing JWT authentication, I had to quickly understand token structure, signing algorithms, and Spring Security filter chains. I read documentation, watched tutorials, and built small prototypes before integrating into the main project.

---

## Quick Reference: Key Concepts to Know

### Must-Know Terms
- **ORM:** Object-Relational Mapping
- **CRUD:** Create, Read, Update, Delete
- **DTO:** Data Transfer Object
- **SOLID:** Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion
- **REST:** Representational State Transfer
- **JWT:** JSON Web Token
- **ACID:** Atomicity, Consistency, Isolation, Durability

### Common Follow-up Questions
1. "Can you explain that in more detail?"
2. "What trade-offs did you consider?"
3. "How would you test this?"
4. "What are the alternatives?"
5. "How does this scale?"

---

*Good luck with your interviews!*
