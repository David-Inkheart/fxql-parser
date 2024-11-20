---

# FXQL Parser API

The FXQL Parser API is a robust system built with NestJS for parsing and validating Foreign Exchange Query Language (FXQL) statements. It validates the syntax, stores valid entries in a PostgreSQL database using Prisma ORM, and provides appropriate responses for both valid and invalid FXQL statements.

## Features

- Parse FXQL statements via API.
- Validate syntax and enforce constraints on currencies, numeric values, and caps.
- Store valid entries in PostgreSQL.
- Return structured success or error responses.
- Implements rate-limiting with Redis.

---

## Setup Instructions

### Prerequisites

1. **Node.js**: Ensure you have Node.js (v18.x or later) installed.
2. **PostgreSQL**: Install PostgreSQL locally or use a cloud-hosted database.
3. **Redis**: Install Redis locally or use a cloud-hosted Redis instance.

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd fxql-parser
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file in the project root:

   ```env
   DATABASE_URL=
   REDIS_HOST=
   REDIS_PORT=
   REDIS_PASSWORD=
   REDIS_USERNAME=
   REDIS_DB=0
   PORT=3000
   THROTTLER_TTL=
   THROTTLER_LIMIT=
   THROTTLER_BLOCK_DURATION=
   ```

4. Run Prisma migrations to set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

---

## API Documentation

### Base URL

- Local: `http://localhost:3000`
- Production: `https://fxql-parser-app-2dd73b37f0cc.herokuapp.com`

### Endpoints

#### **POST /fxql-statements**

Parses and validates FXQL statements, stores valid entries, and returns structured responses.

**Request Body:**

```json
{
  "FXQL": "USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}"
}
```

**Response (Success):**

```json
{
  "message": "FXQL Statement Parsed Successfully.",
  "code": "FXQL-200",
  "data": [
    {
      "EntryId": a427b310-5801-4cba-bbf4-fe59e8c5add0,
      "SourceCurrency": "USD",
      "DestinationCurrency": "GBP",
      "SellPrice": 200,
      "BuyPrice": 100,
      "CapAmount": 93800
    }
  ]
}
```

**Response (Error):**

```json
{
  "message": "Invalid currency code in entry #1: 'usd-GBP'. Currency codes must be exactly 3 uppercase letters.",
  "code": "FXQL-400"
}
```

// link to swagger documentation
**Swagger Documentation:**
The API documentation can be accessed via Swagger UI at the [/api-docs](https://fxql-parser-app-2dd73b37f0cc.herokuapp.com/api-docs) endpoint.

---

## Assumptions and Design Decisions

1. **Architecture**:

   - Uses a modular architecture with NestJS for scalability and maintainability.
   - Separates concerns with services, controllers, and modules.

2. **Syntax Enforcement**:

   - FXQL statements must follow the strict syntax `CURR1-CURR2 { BUY X SELL Y CAP Z }`.
   - Multiple statements must be separated by a double newline (`\\n\\n`).

3. **Validation Rules**:

   - **Currencies (`CURR1`, `CURR2`)**: Exactly 3 uppercase letters.
   - **BUY/SELL**: Numeric with up to 5 decimal places.
   - **CAP**: Whole number (no decimals, non-negative).

4. **Error Handling**:

   - Provides detailed error messages specifying the entry and field causing the issue.
   - Returns consistent error shapes for easy client-side handling.

5. **Database Design**:

   - Uses Prisma ORM with a PostgreSQL backend.
   - Schema includes `Decimal` fields for `BUY` and `SELL` prices, ensuring high precision.
   - Entry IDs are uuids for uniqueness and security, as well as preventing enumeration attacks for possible future scaling.

6. **Rate Limiting**:
   - Blocks requests for a specified duration after exceeding the limit, to prevent abuse.

---

## Local Development Requirements

1. **Environment Setup**:

   - Ensure PostgreSQL and Redis are running locally or accessible via a cloud provider.
   - Use the `.env` file to configure connections.

2. **Available Scripts**:

   - `npm run start:dev`: Start the development server.
   - `npm run build`: Build the application.
   - `npm run start:prod`: Start the production server.

3. **Testing**:
   - Use Postman or any API client to test endpoints.
   - Run Jest tests (if available) for automated testing:
     ```bash
     npm run test
     ```

## Future Enhancements

1. **Authentication**:

   - Add user authentication with JWT for secured API access.

2. **Error Logging**:

   - Implement centralized error logging with a service like Sentry.

3. **Pagination**:

   - Implement pagination for querying stored FXQL entries.

4. **Scaling**:
   - Configure for horizontal scaling with Redis-backed rate limiting.

---
