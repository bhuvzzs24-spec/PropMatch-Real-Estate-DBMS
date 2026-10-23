# PropMatch — Project Report

## 1. Project Overview

PropMatch is a property listing and recommendation application built with
Next.js, React, TypeScript, MySQL, and MongoDB. It supports property
discovery, filtering, buyer preferences, and personalised recommendations.

## 2. Objectives

- Provide a property browsing and search interface.
- Store structured property and transaction-related data in MySQL.
- Store buyer preferences, activity, and recommendation cache data in MongoDB.
- Generate personalised recommendations using property attributes and user
  preferences/activity.
- Demonstrate database constraints, indexes, views, triggers, functions,
  stored procedures, and transaction handling.

## 3. Technology Stack

- Frontend and application framework: Next.js, React, TypeScript.
- Relational database: MySQL.
- Document database: MongoDB.
- Data access: mysql2 and the MongoDB Node.js driver.
- Validation and authentication dependencies are included in package.json.

## 4. Database Design

### MySQL

The existing schema includes tables for users, agent profiles, properties,
locations, property types, amenities, property images, property amenities,
favourites, inquiries, site visits, and price history.

The schema defines primary keys, foreign keys, uniqueness constraints,
NOT NULL requirements, CHECK constraints, ENUM fields, and indexes.
It also defines a FULLTEXT index for property titles and descriptions.

Database objects found in the schema include:

- Views: v_active_listings and v_agent_performance.
- Function: fn_price_per_sqft.
- Procedures: sp_book_visit and sp_close_property.
- Triggers: trg_inquiries_before_insert, trg_properties_price_history,
  and trg_visits_before_insert.

The views were queried successfully during project verification. The other
objects were confirmed in the schema and database listings; individual
behavioural tests should be documented separately.

### MongoDB

The application uses the propmatch_nosql database with collections for
user_preferences, user_activity, and recommendations_cache.

The setup script defines collection setup, validation, and indexes.
The seed script inserts sample preference, activity, and cache documents;
it deletes existing records in these three collections first, so use it
only when resetting demo data is intended.

## 5. Application Features

The project contains routes and services for authentication, properties,
preferences, recommendations, favourites, inquiries, site visits, agent
operations, and administration.

The recommendation generator calculates weighted scores from factors such
as budget, location, property type, bedrooms, amenities, and user behaviour.
The recommendation API stores generated items in MongoDB cache documents.

## 6. Verification Performed

The following checks were observed during development:

- TypeScript check previously completed without output.
- Production build output included the application's route list.
- ESLint reported zero errors and one React Compiler warning in
  components/auth/RegisterForm.tsx.
- MySQL contained populated core tables, including users, properties,
  locations, property types, amenities, and agent profiles.
- Both MySQL views returned records when queried.
- MongoDB preferences and activity collections contained data.
- The recommendation API created a cache document containing recommendation
  items and match scores.

These checks are not a substitute for a complete end-to-end test suite.
Attach fresh terminal output and application screenshots before submission.

## 7. Query Demonstrations

The file db/queries.sql contains demonstration queries for active listings,
filtering, aggregation, price-range search, FULLTEXT search, agent performance,
site visits, inquiries, EXPLAIN, and price-per-square-foot calculation.

Run the queries individually after confirming the schema and database are
available. Save the successful outputs as test evidence.

## 8. Architecture

The Next.js application provides the user interface and API routes.
MySQL stores structured relational data and supports relational queries,
constraints, views, triggers, functions, and transactions.
MongoDB stores user preferences, activity events, and recommendation cache
documents. The recommendation API combines application logic with database
data to return personalised property suggestions.

## 9. Test Evidence To Attach

- Home and property browsing pages.
- Login and buyer preferences.
- Recommendations with match scores and reasons.
- Favourites, inquiries, and site visit workflow.
- MySQL table counts and view outputs.
- Stored procedure, trigger, and function demonstrations.
- FULLTEXT search and EXPLAIN output.
- MongoDB collection counts and recommendation cache output.
- TypeScript, build, and lint command results.

## 10. Conclusion

PropMatch combines a property discovery interface with relational data
management and document-oriented personalisation. The project demonstrates
the use of MySQL for structured property operations and MongoDB for user
preferences, activity, and recommendation caching.

Before final submission, verify all required workflows, attach screenshots,
confirm the repository contains no secrets, and test setup instructions
from a clean checkout.
