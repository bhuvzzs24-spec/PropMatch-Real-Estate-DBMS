# PropMatch

PropMatch is a property listing and recommendation application built with Next.js, React, TypeScript, MySQL, and MongoDB.

## Prerequisites

- Node.js and npm
- MySQL
- MongoDB

## Installation

Clone or download the repository, open the project directory, and install dependencies:

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure your local database credentials and authentication secrets.

Never commit `.env.local` or expose database passwords and authentication secrets.

Set `NEXT_PUBLIC_USE_MOCKS=true` to use mock data or `false` to use the real API mode.

## MySQL Setup

Create the database and import the schema:

```sql
CREATE DATABASE IF NOT EXISTS propmatch;
```

Then, from the project directory, run:

```bash
mysql -u root -p propmatch < db/schema.sql
```

The schema defines tables, indexes, triggers, views, a function, and stored procedures. Check the SQL file before importing it into an existing database, because it contains statements that may drop and recreate tables.

## MongoDB Setup

Run `db/mongo-setup.js` in a MongoDB shell that supports `load()` to create the collections, validation rules, and indexes.

The `db/mongo-seed.js` script inserts sample buyer preferences, activity events, and recommendation-cache records.

**Warning:** The seed script deletes existing records in those three collections before inserting demo data. Run it only when you intend to reset that data.

## Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

## Database Files

- `db/schema.sql` — MySQL schema and database object definitions
- `db/mongo-setup.js` — MongoDB collection setup, validation, and indexes
- `db/mongo-seed.js` — MongoDB demonstration data
- `.env.example` — Example environment variables
- `FRONTEND_README.md` — Frontend implementation notes

## Project Status

Database objects and application functionality should be verified against the project requirements before submission. Refer to the database scripts and test results when preparing the project demonstration.
