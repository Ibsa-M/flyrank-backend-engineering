# FlyRank Backend Engineering API

A Node.js and Express.js backend project developed progressively throughout the FlyRank Backend Engineering internship.

The repository started as a small RESTful CRUD API and was extended through successive backend assignments. The current project combines API design, persistent data storage, PostgreSQL, Docker, authentication, protected routes, Swagger documentation, responsible web scraping, and an LLM-powered enrichment endpoint with schema validation, retries, quarantine handling, usage logging, and evaluation.

**Repository:** [Ibsa-M/flyrank-backend-engineering](https://github.com/Ibsa-M/flyrank-backend-engineering)

---

## Project Progress

The repository is intentionally maintained as one growing backend project rather than separate assignment repositories.

```text
Initial REST API
      │
      ▼
CRUD operations
      │
      ▼
Persistent database storage
      │
      ▼
PostgreSQL + Docker
      │
      ▼
Supabase Authentication + JWT protection
      │
      ▼
Swagger API documentation
      │
      ▼
Polite web-scraping pipeline
      │
      ▼
Validated book data
      │
      ▼
LLM book enrichment API
      │
      ▼
Schema validation + repair + quarantine
      │
      ▼
Retries + usage logging + evaluation
```

Each stage builds on the backend structure established by the previous work.

---

# Current Capabilities

The project currently includes:

* RESTful task CRUD operations
* Controller and repository separation
* PostgreSQL persistence
* Docker and Docker Compose
* Environment-based configuration
* Supabase Authentication
* User signup and login
* JWT access-token verification
* Bearer authentication
* Reusable authentication middleware
* Multiple protected routes
* Logout
* Swagger UI with Bearer/JWT authorization
* Responsible web scraping
* Catalogue-page discovery
* HTML caching
* Book detail-page fetching
* Request timeout and controlled retry handling
* Book parsing and normalization
* Record validation
* Idempotent scraper output
* Scraper execution reporting
* LLM-powered book enrichment
* Versioned LLM prompting
* Zod input/output validation
* Structured JSON model output
* LLM stub mode
* LLM kill switch
* Retry handling for temporary model failures
* `Retry-After` support
* Exponential backoff with jitter
* One repair attempt for invalid model output
* Quarantine of failed model responses
* LLM usage logging
* Evaluation cases and automated scoring

---

# Technology Stack

| Technology              | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| Node.js                 | JavaScript runtime                             |
| Express.js              | HTTP API framework                             |
| PostgreSQL              | Persistent relational database                 |
| Docker                  | Containerized application/database environment |
| Docker Compose          | Local multi-service orchestration              |
| Supabase Auth           | User authentication and JWT issuing            |
| `@supabase/supabase-js` | Supabase integration                           |
| `pg`                    | PostgreSQL client                              |
| Swagger UI              | Interactive API documentation                  |
| `swagger-jsdoc`         | OpenAPI specification generation               |
| Cheerio                 | HTML parsing for the scraper                   |
| OpenAI-compatible SDK   | LLM provider integration                       |
| Zod                     | Input and model-output validation              |
| dotenv                  | Environment configuration                      |

The LLM client is provider-configurable through environment variables rather than being tied directly to one model service.

---

# 1. Backend API Foundation

## CRUD API

The project began as a task-management REST API using Node.js and Express.js.

The initial implementation established the core backend structure:

```text
Client
  │
  ▼
Express routes
  │
  ▼
Controllers
  │
  ▼
Task operations
```

The API supports the standard task operations:

| Method | Endpoint     | Purpose       |
| ------ | ------------ | ------------- |
| GET    | `/tasks`     | List tasks    |
| GET    | `/tasks/:id` | Read one task |
| POST   | `/tasks`     | Create a task |
| PUT    | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

Input validation and appropriate HTTP status codes were established during the CRUD work.

---

# 2. Persistent Database Storage

The next stage moved task storage away from application-only state and into persistent database storage.

The storage layer was separated into:

```text
routes
  ↓
controllers
  ↓
repositories
  ↓
database
```

The repository pattern keeps database-specific operations separate from HTTP request handling.

The database work progressed from the initial SQLite implementation to PostgreSQL.

The final PostgreSQL task table contains:

| Column      | Type    | Constraint                |
| ----------- | ------- | ------------------------- |
| `id`        | SERIAL  | Primary key               |
| `title`     | TEXT    | Not null                  |
| `completed` | BOOLEAN | Not null, default `FALSE` |

The PostgreSQL implementation uses parameterized queries and asynchronous database operations.

---

# 3. PostgreSQL and Docker

The database stage was extended into a containerized development environment.

The project includes:

* PostgreSQL
* Docker
* Docker Compose
* Persistent PostgreSQL storage
* Environment-based database configuration

The application communicates with PostgreSQL through the Docker Compose service rather than depending on a locally installed database server.

The resulting architecture is:

```text
Client / Swagger UI
        │
        ▼
Express API
        │
        ▼
Controllers
        │
        ▼
Repository layer
        │
        ▼
PostgreSQL
        │
        ▼
Docker persistent volume
```

The database implementation was tested for CRUD operations and persistence across container restarts.

---

# 4. Authentication and API Protection

The authentication stage added Supabase Auth to the existing Express API.

Supabase acts as the Identity Provider.

The backend does not implement password hashing or cryptography itself. Supabase manages user accounts and authentication credentials, while the Express application receives and verifies the access tokens issued by Supabase.

## Authentication flow

```text
Client
  │
  │ email + password
  ▼
Express API
  │
  ▼
Supabase Auth
  │
  │ access token / JWT
  ▼
Client
  │
  │ Authorization: Bearer <token>
  ▼
Express API
  │
  ▼
Authentication middleware
  │
  ▼
Supabase token verification
  │
  ├── invalid → 401
  │
  └── valid
        │
        ▼
     Protected route
```

## Authentication endpoints

| Method | Endpoint               | Purpose                               | Authentication |
| ------ | ---------------------- | ------------------------------------- | -------------- |
| POST   | `/auth/signup`         | Create a user account                 | No             |
| POST   | `/auth/login`          | Authenticate and return tokens        | No             |
| POST   | `/auth/logout`         | End the authenticated session         | Yes            |
| GET    | `/protected/profile`   | Return authenticated user information | Yes            |
| GET    | `/protected/dashboard` | Example protected endpoint            | Yes            |
| GET    | `/public/info`         | Return public information             | No             |

## Authentication behavior

The implementation verifies:

* Missing authentication headers
* Malformed Bearer headers
* Invalid tokens
* Tampered tokens
* Expired/invalid authentication states

A valid token produces an authenticated user that can be used by protected routes.

The authentication check was extracted into reusable Express middleware so additional protected routes do not need to duplicate token-verification logic.

---

# 5. Swagger API Documentation

Swagger UI was added to document and test the API.

The documentation is available locally at:

```text
http://localhost:3000/docs
```

The OpenAPI configuration includes Bearer authentication for protected routes.

### Swagger authentication flow

1. Start the API.
2. Open `/docs`.
3. Use `/auth/login` to obtain an access token.
4. Select **Authorize**.
5. Enter the Bearer token.
6. Use **Try it out** on a protected endpoint.

The repository includes the authentication Swagger screenshot:

```text
docs/swagger-auth.png
```

### Swagger screenshot

![Swagger UI](docs/swagger-auth.png)

---

# 6. Polite Web Scraping Pipeline

The Week 5 scraper was added as a separate pipeline inside the same backend repository.

Its target is **Books to Scrape**, a public practice sandbox intended for learning web scraping.

The implementation is deliberately limited to the first three catalogue pages.

## Scraping scope

| Item                 | Result                 |
| -------------------- | ---------------------- |
| Target               | Books to Scrape        |
| Catalogue pages      | First 3                |
| Discovered book URLs | 60 unique URLs         |
| Detail pages         | 60                     |
| Output               | Validated JSON records |
| Report               | JSON execution report  |

The target classification and responsible-scraping decision were documented before the request pipeline was built.

The project also recorded the result of the `robots.txt` check and kept the scraper limited to the assignment target.

---

# 7. Scraper Pipeline

The scraper follows this sequence:

```text
Target classification
        │
        ▼
Fetch catalogue pages
        │
        ▼
Cache HTML
        │
        ▼
Discover book URLs
        │
        ▼
Deduplicate URLs
        │
        ▼
Fetch book detail pages
        │
        ▼
Cache detail HTML
        │
        ▼
Parse book information
        │
        ▼
Normalize fields
        │
        ▼
Validate records
        │
        ├── invalid → excluded
        │
        ▼
books.json
        │
        ▼
run-report.json
```

## Scraper source files

| File                          | Responsibility                                          |
| ----------------------------- | ------------------------------------------------------- |
| `scraper/src/index.js`        | Main scraper pipeline                                   |
| `scraper/src/fetchPages.js`   | Catalogue-page fetching and caching                     |
| `scraper/src/discover.js`     | Catalogue pagination and URL discovery                  |
| `scraper/src/fetchDetails.js` | Book detail-page fetching, caching and failure handling |
| `scraper/src/parseBook.js`    | Book data extraction and normalization                  |

---

# 8. Scraper Request Controls

The scraper was designed to reduce unnecessary requests and handle temporary failures without stopping the complete run.

The implementation uses:

* Identifying User-Agent
* Request timeouts
* Delays between real detail-page requests
* Local HTML caching
* Sequential detail-page processing
* Controlled retry behavior
* Retry handling for timeouts and HTTP 5xx responses
* Failure isolation
* Run statistics

Cached pages are reused during development instead of repeatedly downloading the same HTML.

The cache is excluded from version control.

---

# 9. Scraper Data

The scraper preserves both source information and normalized values.

The generated records contain fields including:

```text
title
product_url
price_text
price_gbp
availability_text
rating_text
rating
description
source_page
fetched_at
```

The original text values are retained where useful, while numeric values such as price and rating are normalized for programmatic use.

The source URL and fetch timestamp provide provenance for each record.

---

# 10. Scraper Validation and Output

Records are checked before they are written to the final output.

Validation includes:

* Required field checks
* Numeric type checks
* URL checks
* Record integrity checks
* Duplicate prevention

Valid records are written to:

```text
scraper/output/books.json
```

Execution statistics are written to:

```text
scraper/output/run-report.json
```

The scraper was designed to be idempotent: rerunning the pipeline does not create duplicate book records.

---

# 11. LLM Book Enrichment API

The latest backend extension adds an LLM-powered enrichment endpoint.

The feature takes a validated book record and asks an LLM to produce a small, controlled JSON result.

This is not implemented as a chatbot. It is a single-request enrichment operation:

```text
Book record
    │
    ▼
Input validation
    │
    ▼
Versioned prompt
    │
    ▼
LLM request
    │
    ▼
JSON parsing
    │
    ▼
Schema validation
    │
    ├── valid ──────────────► JSON response
    │
    └── invalid
           │
           ▼
      One repair attempt
           │
           ├── valid ───────► JSON response
           │
           └── invalid
                  │
                  ▼
              Quarantine
                  │
                  ▼
                422
```

The current implementation is built around the book-enrichment job rather than a general conversational interface.

---

# 12. LLM Job Contract

The job definition is stored in:

```text
JOB-CARD.md
```

### Input

A book record containing:

* `title`
* `description`

### Output

```json
{
  "category": "fiction | nonfiction | business | technology | history | science | biography | poetry | other",
  "summary": "short summary",
  "quality_flags": []
}
```

The category and quality-flag values are restricted to predefined lists.

This makes the model output testable and prevents arbitrary category values from entering the API response.

---

# 13. LLM Implementation

The LLM integration is separated into focused modules:

```text
src/llm/
├── client.js
├── enrich.js
├── parser.js
├── prompt.js
├── quarantine.js
├── retry.js
├── schema.js
└── usageLogger.js
```

## Responsibilities

### `client.js`

Creates the provider client using environment configuration.

### `enrich.js`

Coordinates the complete enrichment process:

* Kill switch
* Stub mode
* LLM request
* Parsing
* Schema validation
* Repair attempt
* Quarantine
* Controlled errors

### `parser.js`

Converts model output into JSON that can be validated.

### `prompt.js`

Loads and constructs the versioned enrichment instructions.

### `schema.js`

Defines the accepted input and output structures using Zod.

### `retry.js`

Controls retries for temporary model/API failures.

### `quarantine.js`

Stores model responses that still fail validation after the repair attempt.

### `usageLogger.js`

Records model usage information for tracking and cost awareness.

---

# 14. LLM Validation

The LLM output is treated as untrusted external data.

The output schema currently restricts:

### Categories

```text
fiction
nonfiction
business
technology
history
science
biography
poetry
other
```

### Quality flags

```text
missing_description
weak_description
uncertain_category
```

Additional output fields are not accepted by the strict JSON schema.

This keeps the LLM behind an explicit API contract.

---

# 15. Stub Mode

The project supports a local stub mode:

```env
LLM_STUB=1
```

When enabled, the enrichment endpoint does not call the model provider.

Instead, it returns a schema-valid deterministic response.

This allows endpoint development and testing without consuming model requests.

---

# 16. LLM Kill Switch

The enrichment implementation also supports disabling the model:

```env
LLM_ENABLED=false
```

When disabled, the endpoint returns a controlled fallback result instead of making an LLM request.

This provides an operational switch for turning model calls off without removing the endpoint from the application.

---

# 17. LLM Retry Policy

The LLM integration treats the model provider as an external service.

Retryable failures include:

* Request timeouts
* HTTP `429`
* HTTP `5xx`

Client/authentication errors are not retried automatically.

When a `Retry-After` header is supplied, the implementation uses it.

Otherwise it uses exponential backoff with jitter.

The retry behavior is isolated in:

```text
src/llm/retry.js
```

---

# 18. Model Output Repair and Quarantine

If the first model response cannot be parsed or does not satisfy the schema, the system performs one repair attempt.

The repair request includes:

* The original input
* The rejected output
* The validation error
* Instructions to return corrected JSON

If the repaired response still fails validation:

1. The response is written to quarantine storage.
2. The endpoint does not return raw model text.
3. The request ends with a controlled `422` response.

This keeps invalid model output away from downstream application logic.

---

# 19. LLM Evaluation

A small evaluation set is stored under:

```text
evals/
├── cases.json
└── run.js
```

The evaluator sends the cases to:

```text
POST /enrich
```

and checks the returned category and required quality flags against the expected values.

The evaluator reports:

```text
Passed: X/Y
Category accuracy: X%
```

This gives the enrichment endpoint a repeatable test set rather than relying only on manual inspection.

---

# 20. Environment Configuration

Secrets and provider configuration belong in `.env`.

The repository contains:

```text
.env.example
```

as the safe configuration template.

Typical configuration includes:

```env
PORT=3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

LLM_BASE_URL=your_provider_base_url
LLM_API_KEY=your_provider_key
LLM_MODEL=your_model
LLM_ENABLED=true
LLM_STUB=0
LLM_MAX_RETRIES=2
```

Use the variable names defined by the current `.env.example` when configuring the local environment.

### Secret handling

* `.env` is not committed.
* `.env.example` contains placeholders.
* Real provider keys must never be placed in source code.
* Supabase service credentials must not be exposed.
* LLM provider keys must not be committed.

---

# 21. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Ibsa-M/flyrank-backend-engineering.git
cd flyrank-backend-engineering
npm install
```

Create the local environment file from the example:

```text
.env.example → .env
```

Add the required local database, Supabase, and LLM configuration.

---

# 22. Run the API

Start the Express application with:

```bash
node app.js
```

The API runs on:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/docs
```

---

# 23. Run the Scraper

The scraper has its own documentation under:

```text
scraper/README.md
```

From the repository root:

```bash
node scraper/src/index.js
```

The scraper produces:

```text
scraper/output/books.json
scraper/output/run-report.json
```

The scraper cache is intended for local development and is excluded from version control.

---

# 24. Test LLM Enrichment Without a Model Call

Set:

```env
LLM_STUB=1
```

Start the server:

```bash
node app.js
```

Then send a request to:

```text
POST /enrich
```

Example:

```bash
curl -X POST http://localhost:3000/enrich ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Example Book\",\"description\":\"An example book description used for testing.\"}"
```

The endpoint should return a schema-valid JSON response without calling the external model.

---

# 25. Test the Evaluation Set

Start the API first.

Then run:

```bash
node evals/run.js
```

The evaluator reads:

```text
evals/cases.json
```

and sends the cases to the enrichment endpoint.

The resulting pass count and category accuracy provide a repeatable measure of the current enrichment behavior.

---

# 26. Repository Structure

```text
first-crud-api/
│
├── config/
│   └── supabase.js
│
├── controllers/
│   └── taskController.js
│
├── docs/
│   └── swagger-auth.png
│
├── evals/
│   ├── cases.json
│   └── run.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│
├── prompts/
│   └── book-enrichment-v1.md
│
├── repositories/
│   └── taskRepository.js
│
├── routes/
│   ├── authRoutes.js
│   ├── enrichRoutes.js
│   └── taskRoutes.js
│
├── scraper/
│   ├── src/
│   │   ├── discover.js
│   │   ├── fetchDetails.js
│   │   ├── fetchPages.js
│   │   ├── index.js
│   │   └── parseBook.js
│   │
│   ├── cache/
│   │   ├── details/
│   │   └── catalogue-page-*.html
│   │
│   ├── output/
│   │   ├── books.json
│   │   └── run-report.json
│   │
│   ├── .gitignore
│   └── README.md
│
├── src/
│   └── llm/
│       ├── client.js
│       ├── enrich.js
│       ├── parser.js
│       ├── prompt.js
│       ├── quarantine.js
│       ├── retry.js
│       ├── schema.js
│       └── usageLogger.js
│
├── JOB-CARD.md
├── .env
├── .env.example
├── .gitignore
├── app.js
├── database.js
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
└── swagger.js
```

`models/` is currently present as part of the project structure but does not contain an implemented model file.

---

# 27. Development Principles Used Throughout the Project

The assignments were completed as one progressively growing backend project.

Several practices carry through the different stages.

## Separate responsibilities

Routes, controllers, repositories, middleware, scraping components, and LLM components have separate responsibilities.

## Validate external input

Input from clients, websites, and LLMs is treated as untrusted until it passes validation.

## Keep secrets outside source code

Environment variables and `.gitignore` are used for credentials and provider configuration.

## Prefer deterministic behavior where possible

Caching, normalized records, schemas, stub mode, and evaluation cases make backend behavior easier to test.

## Handle external failures explicitly

Database failures, authentication failures, scraper failures, and LLM failures are handled at the appropriate layer rather than being allowed to crash the entire application.

## Keep evidence with the project

Swagger screenshots, generated scraper output, run reports, evaluation cases, and assignment-specific READMEs document what was built and tested.

---

# 28. Internship Progress Summary

| Internship stage  | Backend work completed                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Foundation        | Backend-focused portfolio and structured AI-assisted development workflow                                                     |
| CRUD API          | Express REST API and task operations                                                                                          |
| Database          | Persistent storage and repository separation                                                                                  |
| PostgreSQL/Docker | PostgreSQL migration, Docker Compose and persistent database environment                                                      |
| Authentication    | Supabase Auth, JWT verification, protected routes and middleware                                                              |
| Documentation     | Swagger/OpenAPI bearer authentication                                                                                         |
| Scraping          | Books to Scrape pipeline, caching, parsing, normalization and validation                                                      |
| LLM integration   | Book enrichment endpoint with prompt versioning, schema validation, retries, repair, quarantine, usage logging and evaluation |

The important progression is not the number of individual features. It is the change in the backend's responsibilities:

```text
CRUD
→ persistence
→ infrastructure
→ security
→ external data ingestion
→ data validation
→ external model integration
→ model-output validation
→ failure handling
→ evaluation
```

---

# 29. Current Project State

The current `main` branch contains the backend work developed through the repository's completed stages.

The repository currently includes:

* CRUD API
* PostgreSQL persistence
* Docker configuration
* Supabase authentication
* Protected routes
* Swagger documentation
* Books to Scrape scraper
* Scraper output and reporting
* LLM enrichment endpoint
* Versioned enrichment prompt
* Zod schemas
* Retry handling
* Quarantine handling
* Usage logging
* Evaluation cases

The repository history contains **26 commits** on the current public `main` branch.

---

# 30. Assignment Documentation

Detailed assignment-specific documentation is kept close to the implementation.

### Authentication

```text
Week 4 / A4
Auth · Login & Protect
```

Implementation documentation covers:

* Supabase setup
* Signup and login
* JWT verification
* Authentication middleware
* Protected routes
* Logout
* Swagger bearer authentication
* Security practices

### Scraper

```text
scraper/README.md
```

The scraper README covers:

* Target classification
* Scope
* Robots check
* Fetching
* Caching
* Discovery
* Parsing
* Normalization
* Validation
* Retry behavior
* Output
* Responsible scraping

### LLM enrichment

```text
JOB-CARD.md
prompts/book-enrichment-v1.md
evals/cases.json
```

These files define the enrichment contract, prompt specification, and evaluation data separately from the application code.

---

# 31. What This Repository Demonstrates

This project demonstrates a progression from basic HTTP endpoints to a backend that works with several external systems and treats their data carefully.

The completed work covers:

* REST API design
* Layered backend structure
* Database persistence
* SQL and PostgreSQL
* Docker
* Authentication
* JWT verification
* Middleware
* OpenAPI documentation
* Web scraping
* HTTP request controls
* HTML parsing
* Data normalization
* Schema validation
* Failure isolation
* External API integration
* LLM prompt versioning
* Structured model output
* Retry policies
* Quarantine handling
* Usage tracking
* Automated evaluation

The project remains focused on one backend codebase so the progression from one assignment to the next is visible in both the implementation and Git history.

---

## Repository

[GitHub — Ibsa-M/flyrank-backend-engineering](https://github.com/Ibsa-M/flyrank-backend-engineering)


## Swagger UI

The API documentation is available through Swagger UI at:

`http://localhost:3000/docs`

### Swagger Screenshot

![Swagger UI](docs/swagger-auth.png)