---
title: "Announcing QueryLink v1.0.0: Simplify Your UI and Data Integration"
date: 2025-03-04
series: ["ByteAether.QueryLink"]
tags: ["Integration", "Entity Framework", "LINQ", "SQL", "Fullstack", "Database", "Blazor"]
image: header.png
---

We are thrilled to announce the official release of **[QueryLink v1.0.0](https://github.com/ByteAether/QueryLink/)**! This milestone release marks the culmination of our efforts to provide a seamless bridge between UI components and backend data sources powered by `IQueryable`. Whether you're building dynamic data grids or data tables, QueryLink is here to [simplify your life](../20250218_front-back-glue-logic-querylink/index.md) by handling filters, sorting, and query string conversions with minimal code.

## What is QueryLink?

QueryLink is a [NuGet package](https://www.nuget.org/packages/ByteAether.QueryLink/) designed to integrate UI components (like datagrids and datatables) with backend `IQueryable` data sources. It helps you to:
- Define and apply complex filters and sort orders effortlessly.
- Override default behaviors with custom expressions.
- Convert filtering and sorting definitions to and from query strings for smooth HTTP API integration.

By abstracting these common tasks, QueryLink lets you focus on building great applications without getting bogged down in repetitive query logic.

## Key Features

- **Filter Definitions:** Easily define filters using a range of operators (e.g., equals, not equals, greater than, contains, etc.) to refine your queries.
- **Order Definitions:** Specify sorting rules to control how your data is displayed.
- **Expression-Based Overrides:** Customize default filter and order operations to suit your application's needs.
- **Query String Conversion:** Convert definitions to and from query strings, making it straightforward to pass parameters via HTTP requests.
- **IQueryable Extensions:** Directly apply filter and order definitions to your `IQueryable` data sources.

With support for .NET 6.0, .NET 8.0, and .NET Standard 2.1, QueryLink fits neatly into your modern .NET projects.

## Installation

Getting started is as simple as running a single command. Install the latest stable version of QueryLink via NuGet:

```sh
dotnet add package ByteAether.QueryLink
```

If you need a preview version, you can specify it with the `--version` option. This ease-of-installation helps you to integrate QueryLink into your project quickly and reliably.

## How to Use QueryLink

QueryLink provides a few core concepts that make filtering and sorting a breeze:

### 1. Defining Filters and Orders

The `Definitions` class allows you to specify filter and order criteria. For example:

```csharp
var definitions = new Definitions
{
    Filters = new List<FilterDefinition>
    {
        new("Name", FilterOperator.Eq, "John"),
        new("Age", FilterOperator.Gt, 30)
    },
    Orders = new List<OrderDefinition>
    {
        new("Name", IsReversed: false),
        new("Age", IsReversed: true)
    }
};
```

This snippet creates filters to select records where the name equals "John" and age is greater than 30, and then orders the results accordingly.

### 2. Using Overrides for Custom Behavior

Sometimes the default filtering logic isn't enough. QueryLink's `Overrides` class lets you tailor operations using expression-based overrides:

```csharp
var overrides = new Overrides
{
    Filter = new List<FilterOverride>
    {
        new(p => p.Name, p => p.FullName)
    },
    Order = new List<OrderOverride>
    {
        new(p => p.Name, p => p.FullName)
    }
};
```

This approach lets you substitute a property (like `Name`) with another (like `FullName`) when applying filters or orders, offering flexible customization.

### 3. Converting to and from Query Strings

Easily integrate with web APIs by converting your definitions to a query string and back:

```csharp
string queryString = definitions.ToQueryString();
Definitions parsedDefinitions = Definitions.FromQueryString(queryString);
```

This feature ensures that your filtering and sorting logic is easily transferable over HTTP.

### 4. Applying Definitions to IQueryable

Finally, apply your definitions directly to an `IQueryable` source:

```csharp
IQueryable query = dbContext.People.AsQueryable();
query = query.Apply(definitions, overrides);
```

By extending `IQueryable`, QueryLink seamlessly integrates with your existing data-access code, providing a clean and efficient query transformation pipeline.

## Real-World Examples

QueryLink shines in practical scenarios—like integrating with a MudBlazor DataGrid alongside EF Core. The package simplifies server-side data loading by reading grid state, generating query strings, and applying filter and order definitions to your data source. This comprehensive approach means fewer lines of code and less boilerplate for you to manage.

## Join the Community

We believe that community feedback is invaluable. As we celebrate this stable release, we invite you to contribute to the project:
- **Submit Issues or Feature Requests:** Help us make QueryLink even better.
- **Contribute Code:** Fork the repository, implement improvements, and send us a pull request.
- **Spread the Word:** Share your experiences using QueryLink on social media and developer forums.

Your contributions and insights will help shape the future of QueryLink.

## License

QueryLink is released under the MIT License, ensuring that it remains free and open for your use and customization. For more details, please refer to the LICENSE file in the repository.

---

[QueryLink v1.0.0](https://github.com/ByteAether/QueryLink/) is here to make your UI and data integration simpler, more flexible, and efficient. We look forward to seeing the innovative solutions you build with it. Happy coding!