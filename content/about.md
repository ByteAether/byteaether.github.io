---
eleventyNavigation:
  key: "About"
  order: 5
showAside: true
showTOC: false
---
# About me and this Blog

I'm Joonatan Uusväli, a software engineer and architect based in **Tallinn, Estonia**. My passion lies in designing and building backend systems that solve real‑world problems with elegance and efficiency. I typically write services in **.NET Core** using **C#**, craft interactive UIs with **Blazor**, and expose **HTTP APIs (REST [or not](blog/2025/20250311_hyper-action-api/index.md))** via **ASP.NET**. When it comes to data storage, I choose the right tool for the task: **PostgreSQL** for its advanced feature set and extensibility, **Microsoft SQL Server** for seamless integration in enterprise Windows environments, and **MariaDB** when I need a drop‑in **MySQL** alternative with modern enhancements. I've also worked with **Oracle DB** and value the insights I gained from that experience.

## Crafting Modern Architectures

Every project begins with a careful understanding of its domain and the challenges it poses. I frequently turn to **Vertical Slice Architecture** as a way to decompose complex systems into focused, end‑to‑end feature slices—each slice encapsulates its own API, data access, business logic, and UI contract, making development, testing, and deployment more manageable. Yet VSA is just one tool in my architectural toolbox. I also draw on **Domain‑Driven Design** to model rich business domains, **CQRS** when separation of reads and writes brings clarity and scale, and **Ports & Adapters (Hexagonal Architecture)** to isolate core logic from external dependencies. In fact, VSA can be applied within these broader architectures, helping to keep even the largest systems comprehensible and adaptable. To ensure safe, fast delivery, I build CI/CD pipelines (using **GitHub Actions** or **Azure DevOps**) that run builds, tests, and infrastructure changes on every commit. In cloud‑native scenarios, I leverage **Azure**'s managed services, container orchestration, and built‑in observability to deliver resilient, scalable applications.

## Open‑Source Libraries

My three flagship libraries emerged from many years of hands‑on experience with complex projects, where the same challenges kept popping up. I decided to solve these common problems once and for all by packaging robust, reusable solutions:

**[ByteAether.Ulid](/series/byteaether-ulid/)** ([GitHub](https://github.com/ByteAether/Ulid))  
A high‑performance C# implementation of [ULID—Universally Unique Lexicographically Sortable Identifiers](https://github.com/ulid/spec). Designed for scenarios where sortable, timestamp‑encoded IDs improve indexing, logging, and sharding, this library delivers collision‑resistant IDs with minimal overhead.

**[ByteAether.QueryLink](/series/byteaether-querylink/)** ([GitHub](https://github.com/ByteAether/QueryLink))  
Bridges UI components and backend data through type‑safe, `IQueryable`‑driven queries. QueryLink turns your LINQ expressions into HTTP‑friendly endpoints and stubs, eliminating boilerplate and ensuring compile‑time safety across the full stack.

**[ByteAether.WeakEvent](/series/byteaether-weakevent/)** ([GitHub](https://github.com/ByteAether/WeakEvent))  
Addresses the [.NET event subscription problem](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/events/weak-event-patterns) by holding only weak references to handlers. Subscribers can be garbage‑collected naturally, preventing subtle memory leaks and “zombie” objects in long‑running applications.

## Embedded Systems and Beyond

While much of my work resides in the cloud, I thrive on low‑level tinkering. I've built firmware in **C** and **C++** for microcontrollers such as the **ESP32**, **STM32**, and classic **AVR** chips, often running **FreeRTOS**. Prototyping sensor networks or real‑time control loops reminds me of the constrained‑environment lessons that shape every robust server‑side solution I create.

## Philosophy and Outlook

At the heart of my approach is **elegance in code**—an equilibrium of performance, observability, maintainability, and ease of onboarding. Chasing raw performance at the expense of clarity leads to brittle, unmanageable systems; optimizing only for one metric can bloat or fragment your codebase. True elegance emerges when those qualities harmonize into a codebase that is efficient, transparent, and a joy for teams to grow with. I bring deep familiarity with architectural principles like Domain‑Driven Design, CQRS, and Ports & Adapters, and I remain eager to embrace whatever new paradigms and innovations the future holds—from the next wave of .NET features to emerging patterns in distributed systems.

## Let's Connect

All my public projects live on [GitHub](https://github.com/ByteAether). If you'd like to discuss architecture, open source, embedded systems, or simply swap ideas, reach out on [LinkedIn](https://www.linkedin.com/in/joonatan-uusvali/). I'm always excited to collaborate and learn together.
