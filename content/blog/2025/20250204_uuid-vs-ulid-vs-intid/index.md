---
title: "UUID vs ULID vs Integer IDs: A Technical Guide for Modern Systems"
date: 2025-02-04
tags: ["ulid", "uuid", "guid", "id", "entity-framework", "database", "sql", "performance"]
image: header.png
---

Unique identifiers are critical components in software systems, serving as the foundation for data management, distributed architectures, and secure API design. While UUIDs (specifically UUIDv4) and integer IDs have been widely adopted, [ULIDs (Universally Unique Lexicographically Sortable Identifiers)](https://github.com/ulid/spec) are increasingly recognized as a superior choice for modern applications. This article explores the technical distinctions between these identifiers, focusing on performance in .NET ecosystems and the database-level implications of their structural differences.

## Understanding the Identifier Types  

### Integer IDs
Integer IDs are sequential numeric values typically managed by databases through auto-increment mechanisms. Their simplicity and minimal storage requirements (4 bytes for `INT`, 8 bytes for `BIGINT`) make them straightforward to implement and efficient for indexing. However, their predictability exposes systems to security risks such as enumeration attacks (e.g., `/users/123`). Additionally, their reliance on centralized generation makes them unsuitable for distributed systems where coordination between nodes is impractical.

### UUIDs
UUIDs are 128-bit identifiers designed to guarantee global uniqueness through randomness. The UUIDv4 variant, which uses 122 bits of random data, is the most common implementation. While UUIDs excel at collision resistance, their lack of inherent sortability leads to significant database performance issues, particularly in write-heavy systems. The random distribution of UUIDv4 values causes index fragmentation, increasing I/O overhead and reducing cache efficiency.

### ULIDs
ULIDs are 128-bit identifiers composed of a 48-bit timestamp (millisecond precision) and 80 bits of cryptographically secure randomness. Encoded as a 26-character base32 string, ULIDs are lexicographically sortable, compact, and URL-safe. The timestamp prefix ensures that new records are inserted in chronological order, aligning with database indexing patterns to minimize fragmentation.

## Performance in .NET Applications  

### ULID Generation and Monotonicity
In .NET, the **[ByteAether.Ulid](https://github.com/ByteAether/Ulid)** library provides a high-performance implementation of ULID generation. Benchmarks published in its GitHub repository demonstrate that it generates ULIDs with zero heap allocations, leveraging stack-based operations and optimized bitwise manipulation. A key feature of ULIDs is **monotonicity**, which ensures that identifiers generated within the same millisecond increment sequentially. This guarantees that data inserted in a logical order (e.g., batch processing workflows) remains ordered in the database. For example, in a distributed logging system, monotonicity ensures log entries from the same source retain their sequence even if generated microseconds apart. ByteAether.Ulid further enforces this by incrementing the timestamp when the random component overflows, avoiding errors during generation while preserving order.

### Why UUIDs Fall Short
While `Guid.NewGuid()` in .NET is fast, UUIDs lack structural ordering. This forces databases to insert records at random positions within indexes, leading to frequent page splits and fragmentation. ULIDs, by contrast, align insertion patterns with the natural ordering of database indexes, reducing overhead and improving throughput.

## Database Performance: Index Fragmentation Explained

### How Databases Organize Data
Databases store records in fixed-size blocks called **pages** (e.g., 8kB in SQL Server, 16kB in MySQL). These pages are managed within **B+ tree** structures, where leaf nodes store actual data rows, and internal nodes route queries using key values. Sequential insertion ensures new rows are added to the end of the leaf node chain, minimizing disk seeks and memory usage.

### The Impact of Random Identifiers
When identifiers are random (e.g., UUIDv4), new rows are inserted at arbitrary positions within the B+ tree. This forces databases to split existing pages to accommodate entries, a process known as **page splitting**. For example, inserting a record with UUID `f47ac10b-...` into a page already containing `a5670e02-...` may split the page into two, with half the rows moved to a new location.

Page splits have three major consequences:
1. **Increased I/O Overhead**: Fragmented pages require more disk reads to retrieve logically contiguous data.
2. **Memory Pressure**: More pages are loaded into the buffer pool, reducing the cache's effectiveness.
3. **Write Amplification**: Splits generate additional transaction log entries, slowing bulk inserts and increasing storage costs.

### ULID’s Structural Advantage
ULIDs embed a timestamp in their high-order bits, ensuring that new records are inserted sequentially. This aligns with the B+ tree’s design, reducing page splits compared to UUIDv4.

## Implementing ULIDs in .NET with ByteAether.Ulid

### Integration with Database Systems
The **ByteAether.Ulid** library simplifies storing ULIDs as binary data, minimizing storage overhead and accelerating queries. Below are examples of integrating ULIDs with popular .NET data access frameworks:

#### Entity Framework Core Configuration
```csharp
public class Order
{
    public Ulid Id { get; set; } // Stored as BINARY(16)
    public string Product { get; set; }
}

public class UlidToBytesConverter : ValueConverter<Ulid, byte[]>
{
	private static readonly ConverterMappingHints DefaultHints = new(size: 16);

	public UlidToBytesConverter() : this(defaultHints) { }

	public UlidToBytesConverter(ConverterMappingHints? mappingHints = null)
		: base(
			convertToProviderExpression: x => x.ToByteArray(),
			convertFromProviderExpression: x => Ulid.New(x),
			mappingHints: defaultHints.With(mappingHints)
		)
	{ }
}

// In DbContext configuration
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
	// ...
	configurationBuilder
		.Properties<Ulid>()
		.HaveConversion<UlidToBytesConverter>();
	// ...
}
```

#### Dapper Type Handler

```csharp
public class UlidTypeHandler : SqlMapper.TypeHandler<Ulid>
{
    public override void SetValue(IDbDataParameter parameter, Ulid value)
    {
        parameter.Value = value.ToByteArray();
    }

    public override Ulid Parse(object value)
    {
        return Ulid.New((byte[])value);
    }
}

Dapper.SqlMapper.AddTypeHandler(new UlidTypeHandler());
```

### Performance Metrics
The ByteAether.Ulid library generates ULIDs efficiently with zero heap allocations, making it ideal for high-throughput scenarios like event sourcing or real-time analytics. Detailed benchmark results are available in its [GitHub repository](https://github.com/ByteAether/Ulid).

## Recommendations and Conclusion

### When to Use ULIDs

ULIDs are particularly advantageous in:

 * **Distributed Systems:** Decentralized generation eliminates coordination overhead.
 * **Time-Series Workloads:** Embedded timestamps simplify partitioning and range queries.
 * **Batch Processing:** Monotonicity ensures data retains its logical insertion order.

### Why ByteAether.Ulid?

 * **Speed:** Generates ULIDs faster than Guid.NewGuid() in .NET.
 * **Efficiency:** Zero heap allocations reduce garbage collection pressure.
 * **Simplicity:** Seamless integration with EF Core, Dapper, and JSON serializers.

## The Future of Identifiers

UUIDs and integer IDs remain viable for legacy use cases, but ULIDs address their core limitations: sortability, fragmentation, and scalability. For .NET developers, **[ByteAether.Ulid](https://github.com/ByteAether/Ulid)** offers a robust, future-proof solution that aligns application logic with database storage mechanics.

```bash
# Install ByteAether.Ulid
dotnet add package ByteAether.Ulid
```

By adopting ULIDs, teams can achieve faster queries, reduced infrastructure costs, and architectures that scale effortlessly—proving that the right identifier can transform system design.