-- PropMatch: DBMS demonstration queries
-- Run after importing db/schema.sql into the propmatch database.

USE propmatch;

-- Q1. Display active listings from the database view.
SELECT property_id, title, listing_type, price, city, locality,
       bedrooms, bathrooms, price_per_sqft
FROM v_active_listings
ORDER BY created_at DESC
LIMIT 10;

-- Q2. Filter properties by city and listing type.
SELECT property_id, title, price, city, locality, listing_type
FROM v_active_listings
WHERE city = 'Bengaluru'
  AND listing_type = 'RENT'
ORDER BY price ASC;

-- Q3. Calculate average property price by city and listing type.
SELECT city, listing_type, COUNT(*) AS property_count,
       ROUND(AVG(price), 2) AS average_price
FROM v_active_listings
GROUP BY city, listing_type
ORDER BY city, listing_type;

-- Q4. Find properties within a price range.
SELECT property_id, title, price, area_sqft, price_per_sqft
FROM v_active_listings
WHERE price BETWEEN 30000 AND 60000
ORDER BY price ASC;

-- Q5. Search property titles and descriptions using FULLTEXT.
SELECT property_id, title, description,
       MATCH(title, description)
         AGAINST ('apartment Bengaluru' IN NATURAL LANGUAGE MODE) AS relevance
FROM properties
WHERE MATCH(title, description)
        AGAINST ('apartment Bengaluru' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 10;

-- Q6. Review agent performance using the existing view.
SELECT agent_id, agent_name, agency_name, total_listings,
       active_listings, closed_listings, total_inquiries,
       avg_listing_price
FROM v_agent_performance
ORDER BY total_listings DESC;

-- Q7. Review site visit records.
SELECT visit_id, property_id, buyer_id, scheduled_at, status
FROM site_visits
ORDER BY scheduled_at DESC
LIMIT 10;

-- Q8. Review inquiry records.
SELECT *
FROM inquiries
ORDER BY inquiry_id DESC
LIMIT 10;

-- Q9. Inspect the query plan for the property search.
EXPLAIN
SELECT property_id, title, price
FROM properties
WHERE status = 'ACTIVE'
  AND listing_type = 'RENT'
ORDER BY price ASC;

-- Q10. Calculate price per square foot using the existing function.
SELECT property_id, title, price, area_sqft,
       fn_price_per_sqft(price, area_sqft) AS calculated_price_per_sqft
FROM properties
WHERE area_sqft > 0
ORDER BY calculated_price_per_sqft ASC
LIMIT 10;
