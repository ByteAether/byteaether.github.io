---
title: "Announcing ByteAether.Ulid v1.0.0: A High-Performance .NET Implementation of ULID"
date: 2025-01-20
image: header.png
tags: ["ulid", "uuid", "guid", "unique identifier", "id"]
draft: true
---

We’re thrilled to announce the official release of [ByteAether.Ulid v1.0.0](https://github.com/ByteAether/Ulid), a high-performance .NET library for generating and working with [ULIDs (Universally Unique Lexicographically Sortable Identifiers)](https://github.com/ulid/spec). If you’re a developer seeking an identifier system that is unique, sortable, and human-readable, ByteAether.Ulid has you covered.

## Why ByteAether.Ulid?
ULIDs are an excellent alternative to GUIDs and integer-based identifiers in modern applications. While integer IDs are both sortable and human-readable, they lack the global uniqueness required for distributed systems. GUIDs, on the other hand, provide uniqueness but sacrifice readability and sortability. ULIDs combine the strengths of both approaches, offering global uniqueness, lexicographical sortability, and human-readability.

ByteAether.Ulid fully adheres to the [official ULID specification](https://github.com/ulid/spec) and goes the extra mile by addressing certain edge cases that other implementations overlook, such as handling random-part overflow without throwing exceptions.

ByteAether.Ulid is:

* **Universally Unique:** Ensures uniqueness across distributed systems.
* **Sortable:** Lexicographically ordered for efficient time-based sorting.
* **Fast and Efficient:** Designed for low memory usage and high performance.
* **Specification-Compliant:** Faithful to the official ULID standard, with enhancements to ensure reliability.
* **Interoperable:** Includes seamless conversion methods for GUIDs, byte arrays, and strings.

## Key Features
* **Error-Free Generation:** Handles overflow in the random part by incrementing the timestamp, ensuring monotonicity and reliability.
* **Compatibility:** Supports .NET versions ranging from .NET Standard 2.0 to .NET 9.0, making it suitable for a wide variety of projects.
* **Integration:** Includes out-of-the-box support for ASP.NET Core route parameters and `System.Text.Json` serialization.
* **Benchmark-Backed Performance:** Proven to be one of the fastest ULID implementations available, as demonstrated through comprehensive benchmarking against popular libraries like Ultimicro's NetUlid, RobThree's NUlid, and Cysharp's Ulid.

## Installation
You can get started by installing the ByteAether.Ulid NuGet package:

`dotnet add package ByteAether.Ulid`

Visit the [NuGet page](https://www.nuget.org/packages/ByteAether.Ulid/) for more details.

## Getting Started
Here’s how simple it is to generate and use ULIDs with ByteAether.Ulid:

```csharp
using System;

class Program
{
    static void Main()
    {
        // Create a new ULID
        var ulid = Ulid.New();

        // Convert to byte array and back
        byte[] byteArray = ulid.ToByteArray();
        var ulidFromByteArray = Ulid.New(byteArray);

        // Convert to GUID and back
        Guid guid = ulid.ToGuid();
        var ulidFromGuid = Ulid.New(guid);

        // Convert to string and back
        string ulidString = ulid.ToString();
        var ulidFromString = Ulid.Parse(ulidString);

        Console.WriteLine($"ULID: {ulid}, GUID: {guid}, String: {ulidString}");
    }
}
```
For detailed usage instructions and a complete API reference, check out the [GitHub repository](https://github.com/ByteAether/Ulid).

## Performance Highlights
ByteAether.Ulid stands out as one of the fastest and most reliable ULID implementations. Here’s a quick look at how it compares to other libraries:

* **Generation:** Faster than other implementations, while maintaining strict compliance with the ULID specification.
* **Conversions:** Optimized for operations like converting to and from byte arrays, GUIDs, and strings.
* **Monotonicity:** Ensures monotonicity without random exceptions, unlike some competing implementations.

For the full benchmarking results, visit the [GitHub repository](https://github.com/ByteAether/Ulid).

## Open Source and Community Contributions
ByteAether.Ulid is open-source and licensed under the MIT License. We welcome contributions from the community to help improve and expand the library. If you have ideas, bug reports, or enhancements, feel free to open an issue or submit a pull request on GitHub.

## What’s Next?
While this announcement focuses on introducing ByteAether.Ulid, we have more content planned to dive deeper into why ULIDs are a game-changer for modern databases and distributed systems. Stay tuned for upcoming articles exploring best practices, database optimization, and real-world use cases for ULIDs.

---
Start integrating ULIDs into your .NET applications today with [ByteAether.Ulid](https://github.com/ByteAether/Ulid). Let us know your thoughts and feedback—we’re excited to see what you build!