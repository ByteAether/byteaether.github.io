---
title: "Understanding UUIDs, ULIDs, and Database Performance: A Deep Dive into Optimizing Inserts and Indexes"
date: 2025-01-06
tags: []
draft: true
---
In modern systems, especially in the context of databases, generating unique identifiers for entities is a fundamental operation. These identifiers, also called UUIDs (Universally Unique Identifiers), are key to ensuring that each record has a unique and distinguishable key. However, the choice of the identifier and how it is generated can have a profound impact on database performance. Specifically, the use of UUIDv4 (a random UUID) versus ULID (Universally Lexicographically Sortable Identifier) can drastically alter the efficiency of insert operations and index performance in relational databases.

In this article, we’ll dive into the performance implications of UUIDs, particularly focusing on UUIDv4, which is the most widely used version, and explore how the use of ULIDs can optimize database operations, particularly in systems that need high-throughput inserts and minimal index rebalancing.

## The Impact of Random UUIDs (UUIDv4) on Database Indexes
UUIDs are used for their ability to provide globally unique identifiers that can be generated without coordination between different systems. UUIDv4, one of the most commonly used versions, generates identifiers from random values. While UUIDv4 is an excellent choice for uniqueness, it comes with a performance cost when it’s used as the primary key in a database.

### What Happens When You Insert Random UUIDs?
When UUIDv4 is used, the generated values are completely random. As a result, their insertion order doesn't follow any predictable pattern. This lack of order presents a problem when these UUIDs are indexed in a B+ tree data structure, which is the most common indexing method used by relational databases.

### The B+ Tree Structure
A B+ tree is an ordered tree data structure used to efficiently store and retrieve data. In a B+ tree, data is kept sorted in the leaf nodes, and the internal nodes serve as a guide to help search for data efficiently. As new entries are inserted, the B+ tree tries to maintain its order by splitting nodes when necessary.

However, when random UUIDs are inserted into the B+ tree index, the insertion points are unpredictable. This means that each insert could potentially trigger a node split, which leads to the following performance issues:

* **Inefficient Insert Operations:** Since random UUIDs are not ordered, each insert might force a page split in the index. A page split involves dividing an index page into two parts, which is a costly operation that involves moving data around in memory and on disk.
* **Increased Index Maintenance Overhead:** With frequent page splits, the database must frequently update not only the leaf nodes of the B+ tree, but also the internal nodes. These updates can be expensive in terms of CPU usage and I/O operations, especially when dealing with a large number of records.

### Example: Inserting Random UUIDs in a Database
Consider inserting the following random UUIDs into a database that uses a B+ tree index:

`10, 90, 80, 40, 5, 70, 60`

Each of these values will be inserted into the index in no particular order. Let’s break down what happens at each step:

1. **Insert 10:** The index page is empty, so 10 is inserted at the first available spot.
2. **Insert 90:** A second entry is added, and it fits into the page without splitting.
3. **Insert 80:** Since 80 is smaller than 90 but larger than 10, it has to be inserted in between, requiring a split.
4. **Insert 40:** 40 is inserted, which might cause further splits, pushing more reorganizations.

As new entries are inserted, the index will continually split pages, causing significant overhead and slowing down performance over time.

## Performance Costs and Database Bottlenecks
The randomness of UUIDv4 causes several inefficiencies, leading to serious performance bottlenecks in databases:

1. **Increased Disk I/O:** Each page split requires new disk writes, meaning the system must access disk storage frequently. If the index pages are constantly being split, this results in high disk I/O, which is one of the slowest operations in databases.
2. **Buffer Pool Thrashing:** Modern databases use a buffer pool to cache index pages in memory to minimize disk I/O. However, with random inserts, the buffer pool can quickly fill up with pages that are frequently split and need to be evicted, causing the system to perform additional reads and writes to disk.
3. **Slower Query Performance:** As the B+ tree structure becomes more fragmented and disordered, search operations that rely on the index may become slower because the tree is not as balanced and needs more adjustments for each query.

## Ordered UUIDs: The Benefits of a Sequence-Based Approach
Given the performance drawbacks of random UUIDs, one possible solution is to generate identifiers that are sequential in nature. Ordered identifiers allow the database’s index structure to handle insertions more efficiently, as the values are inserted in a predictable order.

### The Case for ULID
One of the most effective solutions for creating sequential identifiers while still maintaining global uniqueness is **ULID** (Universally Lexicographically Sortable Identifier). ULID is designed to be lexicographically sortable, which means that identifiers generated in sequence will naturally be ordered when sorted lexicographically.

ULIDs are based on a 128-bit value that is split into two parts:

1. **Timestamp (48 bits):** The first part of the ULID contains a millisecond-precise timestamp, ensuring that identifiers are sorted based on time.
2. **Randomness (80 bits):** The second part of the ULID contains 80 bits of randomness, ensuring global uniqueness even when generated at the same millisecond.

This lexicographical sortability makes ULIDs ideal for use as database keys, as the database index can maintain a natural order during inserts. Because new ULIDs are inserted sequentially, index rebalancing is minimized, reducing the overhead of frequent page splits and reorganization.

## ULID and Performance Optimization: ByteAether's .NET Implementation
If you’re working with .NET and need an optimized, high-performance ULID generator, **ByteAether** offers a highly optimized ULID implementation on GitHub. This library is designed to be as fast and efficient as possible, making it a perfect choice for scenarios that demand maximum throughput and low latency when generating unique identifiers.

You can access the **ByteAether’s ULID library** at [ByteAether/Ulid on GitHub](https://github.com/ByteAether/Ulid). Some key features of this implementation include:

* **Optimized for performance:** The ByteAether ULID implementation is fine-tuned for extreme performance, making it one of the fastest ULID generators in the .NET ecosystem.
* **Thread safety:** This implementation is thread-safe, meaning it can be used in high-concurrency environments without risk of data corruption or performance degradation.
* **High scalability:** Whether you're generating thousands or millions of ULIDs per second, the ByteAether implementation can handle the load without significant performance degradation.
* **Full compatibility with .NET applications:** The library seamlessly integrates into any .NET application, ensuring that you can replace UUIDv4 with ULID without major changes to your architecture.

## Shopify's Case: From UUIDv4 to ULID
Shopify, the e-commerce giant, [faced significant performance challenges](https://shopify.engineering/building-resilient-payment-systems) as their platform scaled. Originally, Shopify used UUIDv4 to uniquely identify orders. However, as their transaction volume grew, they began to notice performance degradation in their database operations due to the random nature of UUIDv4.

The company switched to ULIDs, and the results were significant. ULIDs are lexicographically sortable, so Shopify’s database could now insert new identifiers in a predictable order, minimizing the number of page splits and index reorganizations. This change led to a dramatic improvement in the speed of both insert and query operations, enabling Shopify to handle its growing workload more efficiently.

## When Should You Use UUIDv4 vs ULID?
While ULIDs offer substantial benefits in terms of database performance, there are certain scenarios where UUIDv4 might still be appropriate:

* **Security and Anonymity:** UUIDv4’s randomness makes it a good choice when you need a level of unpredictability for security reasons (e.g., when identifiers are exposed to the client and need to be difficult to guess).
* **Existing Systems and Compatibility:** If your system relies heavily on UUIDv4, transitioning to ULID might require significant changes to the architecture and database schema. However, in new systems, ULID is often the better choice.
* **Distributed Systems:** If your identifiers are generated across multiple distributed systems and you don’t require them to be ordered, UUIDv4 might be the more flexible option.

In most modern applications, especially those that involve high-throughput or large-scale databases, ULID is the preferred choice for performance optimization.

## Conclusion: Optimizing Database Performance with ULID
While UUIDv4 ensures global uniqueness, it introduces significant performance challenges, particularly in high-transaction databases using B+ tree indexing structures. By opting for ULID, which offers lexicographical sorting and predictable order, systems can significantly reduce index overhead, disk I/O, and the cost of page splits, resulting in more efficient inserts and queries.

For developers working in .NET, [ByteAether’s ULID library](https://github.com/ByteAether/Ulid) provides an ultra-optimized, thread-safe solution that ensures minimal latency even when generating millions of ULIDs per second. ULID’s superior performance, combined with its simplicity and scalability, makes it an excellent alternative to UUIDv4 in modern, high-performance systems.

By understanding the trade-offs between UUIDv4 and ULID and adopting ULID for scenarios requiring high write loads, developers can ensure their applications perform optimally and scale effectively.

---
Start integrating ULIDs into your .NET applications today with [ByteAether.Ulid](https://github.com/ByteAether/Ulid). Let us know your thoughts and feedback—we’re excited to see what you build!