---
title: "ULIDs as the Default Choice for Modern Systems: Lessons from Shopify's Payment Infrastructure"
date: 2025-02-11
series: ["ByteAether.Ulid"]
tags: ["ULID", "UUID", "ID", "Database", "SQL", "Shopify", "Performance"]
image: header.png
---

In distributed systems, the choice of identifier is rarely a neutral decision. It impacts everything from database performance to operational debuggability. For years, UUIDs (Universally Unique Identifiers) were the default solution for generating unique keys, but their limitations become glaring in high-scale environments. Shopify's engineering team encountered these challenges firsthand while rebuilding their payment systems - a project where milliseconds and reliability mattered. Their solution? [ULIDs (Universally Unique Lexicographically Sortable Identifiers)](https://github.com/ulid/spec). This article explores why ULIDs are not just an alternative to UUIDs but a superior default choice for most applications, drawing on Shopify's experience to illustrate their transformative potential.  

## What Are ULIDs, and Why Do They Matter?

A ULID is a 128-bit identifier designed to combine uniqueness with inherent sortability. Its structure is simple but powerful:  
- The first 48 bits encode a timestamp, representing milliseconds since the Unix epoch.  
- The remaining 80 bits are cryptographically secure random data, ensuring global uniqueness.  

For example, the ULID `01JJP9VSVRWSMP4QEJTYYFSJE8` starts with a timestamp (`01JJP9VSVR`) that corresponds to a precise moment in time, followed by a random suffix (`WSMP4QEJTYYFSJE8`). This design allows ULIDs to be sorted lexicographically, meaning they retain the chronological order of their creation. Unlike UUIDs, which are fundamentally random, ULIDs embed meaningful metadata (the timestamp) while preserving uniqueness.  

### The Problem with UUIDs in Real-World Systems  

Shopify's payment systems initially relied on UUIDv4 for idempotency keys—unique identifiers that prevent duplicate processing of payment requests. While UUIDs ensured uniqueness, their randomness created two critical issues:  

1. **Database Performance Degradation**: Databases like MySQL use B-tree indexes, which optimize for sequential writes. Random UUIDs force the database to insert entries at arbitrary positions in the index, leading to frequent page splits. These splits fragment the index, increasing write latency and disk I/O. At Shopify's scale, where millions of transactions occur daily, this fragmentation caused measurable slowdowns.  
2. **Operational Complexity**: UUIDs lack embedded metadata. To trace the timing of a transaction, engineers had to join tables or query additional timestamp columns. This added complexity to debugging and auditing, especially during incidents requiring rapid root-cause analysis.  

ULIDs addressed both problems. By making identifiers sortable, they eliminated the database fragmentation caused by UUIDs. The embedded timestamp also provided immediate context for debugging, reducing reliance on secondary metadata.

## Shopify's Journey: How ULIDs Transformed Their Payment Systems  

### The Role of Idempotency Keys  

In payment processing, idempotency is critical. If a buyer's network connection drops during checkout, the client must retry the payment without risking a double charge. Idempotency keys solve this: the client sends the same key with each retry, and the server returns the original result instead of reprocessing the request.  

Initially, Shopify used UUIDv4 for these keys. However, as transaction volume grew, the limitations of random UUIDs became untenable.  

### The Switch to ULIDs  

Shopify replaced UUIDv4 with ULIDs for idempotency keys, achieving three key improvements:  

1. **50% Faster Database Inserts**: By ensuring identifiers were chronologically ordered, ULIDs allowed MySQL to append new records sequentially. This aligned with the natural behavior of B-tree indexes, reducing page splits and write latency. In high-throughput systems, this optimization halved the time required for INSERT operations.  
2. **Simplified Debugging**: The timestamp within ULIDs eliminated the need for separate timestamp columns. Engineers could instantly determine when a transaction occurred by parsing the ULID, accelerating incident response. For example, filtering logs by ULID prefixes narrowed results to specific time windows without complex queries.  
3. **Reduced Storage Overhead**: With ULIDs, Shopify no longer needed to maintain separate timestamp columns for sorting. This streamlined their schema and reduced storage costs.  

### Technical Implementation Insights  

Shopify's implementation highlights practical considerations for adopting ULIDs:  

- **Client-Side Generation**: ULIDs were generated at the client level to avoid centralized bottlenecks. This distributed approach aligned with Shopify's resilience goals, ensuring no single point of failure in key generation.  
- **Binary Storage**: Storing ULIDs as binary data (rather than strings) minimized storage footprint while retaining sortability.  
- **Backward Compatibility**: Existing UUIDs were left untouched in low-priority systems, allowing incremental migration without disrupting legacy workflows.  

## Why ULIDs Are Almost Always the Better Default  

### Performance and Scalability  

In distributed systems, write performance is often a bottleneck. ULIDs eliminate the overhead of random writes, making them ideal for high-throughput applications like payment processing, event logging, or real-time analytics. Sequential writes reduce disk I/O and index maintenance, which is critical at scale.  

### Built-In Observability  

ULIDs embed a creation timestamp, effectively acting as free metadata. This is invaluable for debugging:  

- Engineers can correlate logs across services using the ULID's timestamp, even in systems without centralized tracing.  
- Auditing becomes simpler, as the order of events is implicit in the identifier itself.  

### Future-Proof Design  

ULIDs are encoding-agnostic. While often represented in Base32 (which is URL-safe and avoids UUID's hexadecimal ambiguity), they can be stored as binary or other formats. This flexibility makes ULIDs adaptable to diverse use cases, from API request IDs to distributed trace identifiers.  

### Collision Resistance: Sufficient for Most Cases  

While UUIDv4 offers 122 bits of randomness (compared to ULID's 80 bits), ULID's collision probability remains negligible for nearly all applications. At 80 bits, the chance of collision is roughly 1 in 1.2×10^24 — a risk so low that even systems processing billions of daily transactions would take millennia to encounter a duplicate.  

## When UUIDs Might Still Be Appropriate  

UUIDs retain niche utility in scenarios where hiding timestamps is a requirement, such as:  

- **Anonymous Identifiers**: Systems that anonymize user data might avoid ULIDs to prevent exposing activity timelines.  
- **Legacy Systems**: Migrating entrenched UUID-based systems may not justify the effort if performance isn't a bottleneck.  

However, these cases are exceptions. For the vast majority of applications — payment systems, IoT event streams, user session tracking — ULIDs offer a strict superset of UUID benefits.  

## Adopting ULIDs: Best Practices  

Shopify's experience provides a blueprint for successful ULID adoption:  
1. **Prioritize High-Impact Systems**: Begin with critical components where performance gains matter most (e.g., payment idempotency keys).  
2. **Leverage Database Optimizations**: Use clustered indexes (e.g., InnoDB's PRIMARY KEY) to fully benefit from sequential writes.  
3. **Educate Teams**: Ensure engineers understand how to extract timestamps from ULIDs and leverage their sortability in queries.  

## Conclusion: ULIDs as the New Standard  

Shopify's success with ULIDs underscores a broader truth: in modern system design, uniqueness alone is insufficient. Identifiers must also enable performance, observability, and scalability. ULIDs deliver on all fronts, making them the default choice for engineers building resilient systems.  

UUIDs served a vital role in the past, but their randomness is a relic of an era before hyperscale systems. ULIDs, with their blend of sortability and uniqueness, address the demands of today's applications. As Shopify demonstrated, the benefits are tangible—reduced latency, streamlined debugging, and simpler schemas.  

Unless a system explicitly requires timestamp obfuscation or must maintain legacy compatibility, ULIDs should be the default. They represent an evolution in identifier design, one that aligns with the realities of distributed, high-scale computing. The question isn't whether to adopt ULIDs—it's how quickly you can migrate.  

---  
*For a deeper dive into Shopify's approach, read their original article: [10 Tips for Building Resilient Payment Systems](https://shopify.engineering/building-resilient-payment-systems).*  