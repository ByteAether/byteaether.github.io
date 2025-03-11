---
title: "HyperAction API: A Reimagined Approach to HTTP API Design"
date: 2025-03-11
series: ["HyperAction API"]
tags: ["API", "HTTP API", "REST API", "Vertical Slice Architecture", "Integration", "Fullstack"]
image: header.png
---

Traditional [REST](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) designs emphasize [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations over distinct business actions, forcing developers to implement significant business logic on the client side while backends simply translate raw database records into HTTP responses. As a result, the intended business rules become obscured and must be redundantly re-implemented on the server side—complicating maintenance and creating security vulnerabilities.

One major flaw arises from shared data models that are designed around generic resources rather than tailored to specific business features. For example, a single "User" endpoint might return all associated details—including sensitive fields like email addresses—even when the client requires only a list of online usernames. This forces clients to make multiple API calls to compile the necessary data and increases the risk of unintended data exposure.

In contrast, adopting a [vertical slice architecture](https://www.jimmybogard.com/vertical-slice-architecture/)—where each feature or business action is developed as a self-contained unit (encapsulating all layers from user interface to data access)—directly addresses these issues. Vertical slices isolate business logic, ensuring that changes in one domain do not affect unrelated parts of the system. This approach simplifies development and maintenance while aligning API behavior with specific business capabilities.

Drawing on extensive experience with both large-scale and smaller applications, the HyperAction API convention reimagines HTTP API design by centering endpoints around clear, action-oriented business operations. This method enhances security, minimizes redundancy, and fosters a more maintainable system architecture.

---

This document outlines the technical guidelines for the new **HyperAction API** convention. Departing from traditional REST paradigms, HyperAction API enforces batch processing at every endpoint, aligns endpoints with specific business actions, and incorporates explicit mechanisms for consistency and asynchronous operations. The objective is to create a clear and efficient contract between clients and servers that minimizes the common pitfalls of REST while meeting modern application needs.

Each design decision is explained by comparing conventional REST approaches with their challenges, then detailing our design decisions with updated examples that adhere to the batching principle.

## Key Concepts

- **Vertical Slice Architecture:**  
  A design approach where each business feature is developed as a self-contained unit, encapsulating all necessary layers (from user interface to data access). This minimizes interdependencies and simplifies maintenance.

- **Action-Oriented Endpoints:**  
  Endpoints designed to execute specific business operations rather than generic CRUD functions, ensuring that business logic is directly integrated into the API.

- **Batch Processing:**  
  The practice of handling multiple data items in a single API call, which promotes atomic operations and reduces the need for multiple round-trips between the client and server.

## 1. Use Singular Naming Conventions

### Traditional REST Approach  
Many REST APIs use plural names (e.g., `/users`, `/orders`) to indicate collections of resources. This approach can be ambiguous when handling irregular plurals.

### Challenges  
Plural names may lead to confusion with irregular words—such as "mouse" versus "mice" or "octopus" versus "octopi"—and can complicate the mental model of the API. In a batch-based system where every endpoint already handles multiple items, the plurality is implied by the data structure, not the endpoint name.

### HyperAction API Decision  
In HyperAction API, all endpoint and model names are singular. Even though requests and responses always use arrays, the endpoint name itself represents the individual item type. This convention avoids ambiguity, simplifies naming, and reinforces that the batch behavior is a global characteristic of the API.

#### Example  
An endpoint to retrieve users is named singularly:

**HTTP Request**  
```http
GET /user?limit=10&offset=0 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 10
X-Limit: 10
X-Offset: 0

[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" },
  ...
]
```

Similarly, a business action such as account verification remains singular:

**HTTP Request**  
```http
POST /account/verify HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  { "userId": 789, "token": "ABC123XYZ" }
]
```

**HTTP Response**  
```http
HTTP/1.1 207 Multi-Status
Content-Type: application/json

[
  { "userId": 789, "status": 200 }
]
```

This naming convention clarifies that although each payload contains multiple items, the fundamental unit of operation remains singular.

## 2. Headers Instead of Envelope Models

### Traditional REST Approach  
Many APIs wrap data in envelope objects that include metadata like status and pagination details, leading to additional nesting and complexity.

### Challenges  
The extra layer of an envelope model forces clients to parse both the data and metadata, which complicates the data extraction and processing logic.

### HyperAction API Decision  
Responses for list endpoints return a raw array of items. Metadata such as total count, offset, and limit is communicated exclusively through HTTP headers like `X-Count`, `X-Total-Count`, `X-Limit`, and `X-Offset`.

#### Example  
A product listing request:

**HTTP Request**  
```http
GET /product?limit=20&offset=0 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 20
X-Total-Count: 250
X-Limit: 20
X-Offset: 0

[
  { "productId": 101, "name": "Widget A", "price": 9.99 },
  { "productId": 102, "name": "Widget B", "price": 12.99 },
  ...
]
```

Based on [RFC 6648](https://datatracker.ietf.org/doc/html/rfc6648), the "X-" prefix on custom headers is not a requirement. This document does not enforce the use of the "X-" prefix; however, the examples include it because this naming convention is widely recognized and helps make custom headers easier to read and understand.

## 3. Batch Endpoints for All Operations

### Traditional REST Approach  
RESTful designs typically offer endpoints such as `GET /items/{id}` or `PUT /items/{id}` that focus on individual resources. When multiple items must be handled, the client is forced to make several calls or use loosely defined batch endpoints.

### Challenges  
Focusing on single resources increases round-trips and may lead to inconsistency when operations naturally involve multiple entities. It also forces clients to stitch together logic for batch processing, which can become cumbersome.

### HyperAction API Decision  
Every endpoint in HyperAction API is a batch endpoint. There is no dedicated endpoint for a single-item operation; instead, all operations—whether for retrieval, creation, or update—are designed to work with arrays. This not only ensures atomic, batch-based processing but also enforces a mindset where the client always works with collections of data.

#### Example  
To retrieve items, a client issues:

**HTTP Request**  
```http
GET /item?filter=id:123,456 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 2
X-Total-Count: 2
X-Limit: 50
X-Offset: 0

[
  { "id": 123, "name": "Item One", "price": 14.99 },
  { "id": 456, "name": "Item Two", "price": 7.99 }
]
```

## 4. Pagination Using Limit and Offset

### Traditional REST Approach  
Many REST APIs use `page` and `pageSize` parameters, which hide the actual dataset position and force clients to convert page numbers into offsets.

### Challenges  
The abstract concept of a page makes it harder to implement progressive loading or infinite scrolling. Clients must perform additional calculations to determine the proper slice of data.

### HyperAction API Decision  
Endpoints return list results using explicit `limit` and `offset` parameters. This clear slicing method allows clients to directly control the amount of data and its position, simplifying custom pagination logic.

#### Example  
A request for a subset of orders:

**HTTP Request**  
```http
GET /order?limit=50&offset=100 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 50
X-Total-Count: 1000
X-Limit: 50
X-Offset: 100

[
  { "orderId": 201, "amount": 99.99, "status": "completed" },
  { "orderId": 202, "amount": 149.99, "status": "pending" },
  ...
]
```

With efficient pagination established, we now turn to designing endpoints that reflect discrete business actions—ensuring that each endpoint aligns with a specific operational capability.

## 5. Business Logic–Specific Endpoints

### Traditional REST Approach  
Generic endpoints such as `/users` or `/orders` attempt to cover all CRUD operations and often reuse generic models, which may lead to oversharing of data or the mixing of unrelated business logic.

### Challenges  
Using a single resource endpoint for various actions increases the risk of exposing unnecessary details and complicates segregation of business processes.

### HyperAction API Decision  
Each endpoint is crafted for a specific business action. Every business-logic action endpoint now receives and responds with arrays of items, ensuring that the interface naturally supports batch processing.

#### Example  
For account verification, instead of a single-object payload, the endpoint handles an array of verification requests:

**HTTP Request**  
```http
POST /account/verify HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  { "userId": 789, "token": "ABC123XYZ" }
]
```

**HTTP Response**  
```http
HTTP/1.1 207 Multi-Status
Content-Type: application/json

[
  { "userId": 789, "status": 200 }
]
```

This design keeps the interface consistent with batch processing while encapsulating business logic within dedicated endpoints. By designing endpoints specifically for discrete business actions, we sidestep the pitfalls of generic data handling and establish a clear, action-oriented approach to API design.

## 6. Action-Oriented Endpoints over CRUD

### Traditional REST Approach
Traditional CRUD endpoints focus solely on direct data manipulation and tend to oversimplify underlying business processes. This design forces clients to manage critical business logic—often duplicating effort and increasing security risks—while the backend merely acts as a conduit for raw data.

### Challenges  
Generic CRUD endpoints can force clients to manage business rules or risk unwanted side effects by treating operations as mere data transformations.

### HyperAction API Decision  
Endpoints are explicitly designed for business actions. Even when these endpoints appear similar, they are modeled with distinct request and response payloads—and both are arrays. This makes the intended action explicit and separates it from simple data manipulation.

#### Example  
For an address change, the API now expects an array of address change requests:

**HTTP Request**  
```http
POST /account/change-address HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  {
    "userId": 789,
    "address": "123 New Street, Cityville, Country"
  }
]
```

**HTTP Response**  
```http
HTTP/1.1 207 Multi-Status
Content-Type: application/json

[
  { "userId": 789, "status": 200 }
]
```

This explicit batching reinforces the notion that operations are designed for multiple items at once.

The HyperAction API employs action-oriented endpoints that integrate business logic directly into each operation. By embedding the intended business actions within the API itself, these endpoints offer clearer semantics and enhanced security. This shift not only streamlines client interactions by reducing the need for multiple calls but also ensures that each endpoint directly reflects a distinct business capability.

## 7. CRUD-Like Operations via Form Loading and Saving

### Traditional REST Approach  
Typically, REST APIs implement simple CRUD endpoints for basic data manipulation without substantial business logic. This often results in "proxy" endpoints that merely transfer data from the client to the database without additional contextual processing.

The approach described here is most applicable to systems where the frontend and backend are developed together as a single, cohesive unit. In tightly integrated environments, close coordination between UI requirements and backend implementations can be achieved, making form loading and saving an effective pattern for streamlining data handling and reducing the need for redundant API calls. Conversely, for general public APIs—where the consumer or client code is developed by external parties—a more standardized and decoupled approach using traditional CRUD endpoints may be preferable to accommodate the varied requirements and integration patterns of third-party developers.

### Challenges  
- **Data Pre-Filling:** When editing an entry, the form should be pre-populated with existing data and/or default values, a task that generic CRUD endpoints struggle to support.  
- **UI Requirements:** For example, drop-down fields might only store an ID in the data payload, while the UI requires a human-readable label for display.  
- **Lack of Context:** Generic CRUD endpoints do not provide the supplementary information necessary to accurately render forms with all required details.

### HyperAction API Decision  
In HyperAction API, we reconceptualize these operations as "form loading" and "form saving" to address these challenges:

- **Load Endpoint:**  
  When a form is opened, a load request is made. This endpoint returns the form model along with additional contextual data (such as ID-to-text mappings for drop-down fields) as a header object, ensuring that the form is pre-filled—either with existing data when editing an entry or with default preselected values when creating a new one—so it is ready for user interaction.

- **Save Endpoint:**  
  When a user submits a form, the save endpoint accepts the same form model in its request. This approach ensures that the data, including any hidden identifiers, is consistently validated and processed.

Both endpoints adhere to the batching principle, allowing multiple forms to be loaded or saved in a single request.

#### Example

**HTTP Request (Loading form)**  
```http
GET /form/user-profile?ids=123, HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response (Loading form)**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 2
X-Total-Count: 2
X-Form: { "roleId": { 5: "Administrator", 6: "User" } }

[
  {
    "userId": 123,
    "etag": "a1b2c3d4",
    "name": "Alice",
    "email": "alice@example.com",
    "roleId": 5
  },
  {
    "name": "",
    "email": "",
    "roleId": 6
  }
]
```

**HTTP Request (Saving form)**  
```http
POST /form/user-profile HTTP/1.1
Host: api.example.com
Content-Type: application/json
X-Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000

[
  {
    "userId": 123,
    "etag": "a1b2c3d4",
    "name": "Alice Updated",
    "email": "alice.new@example.com",
    "roleId": 5
  },
  {
    "userId": 456,
    "name": "Bob Created",
    "email": "bob.created@example.com",
    "roleId": 6
  }
]
```

This dual-endpoint approach for form operations ensures that even simple data manipulations are handled with the same rigor and consistency as more complex business actions, aligning seamlessly with the overarching principles of the HyperAction API convention.

## 8. Using HTTP Status Code 207 (Multi-Status) for Batch Operations

### Traditional REST Approach  
Batch operations often return a generic `200 OK` even when different items in the batch yield mixed results, masking individual errors.

### Challenges  
A generic status code does not allow clients to easily identify which items in a batch succeeded or failed, complicating error handling and recovery.

### HyperAction API Decision  
For operations that process batches with mixed outcomes, the API uses HTTP status code **207 Multi-Status**. The response body provides an array of per-item status information, giving clients granular feedback.

#### Example  
A batch update of order statuses:

**HTTP Request**  
```http
POST /order/update-status HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  { "orderId": 201, "newStatus": "shipped" },
  { "orderId": 202, "newStatus": "cancelled" }
]
```

**HTTP Response (207 Multi-Status)**  
```http
HTTP/1.1 207 Multi-Status
Content-Type: application/json

[
  { "orderId": 201, "status": 200, "message": "Status updated successfully" },
  { "orderId": 202, "status": 400, "message": "Invalid transition to 'cancelled'" }
]
```

## 9. Asynchronous Processing for Long-Running Operations

### Traditional REST Approach  
Long-running operations are typically processed synchronously, which may result in timeouts and a poor user experience.

### Challenges  
Holding a connection open during lengthy processing risks timeouts and duplicated requests, degrading both client and server performance.

### HyperAction API Decision  
For operations that take an extended time, asynchronous processing is strongly encouraged. Two strategies are provided:
1. **Callback URL:** The client submits an array of requests with callback URLs. Once processed, the server calls the provided URL for each item with a minimal payload.
2. **Polling with Job ID:** Alternatively, the server immediately returns a batch of job identifiers or URLs. Clients can then poll or use long-polling to track each job's progress.

#### Example (Callback URL)  
**HTTP Request**  
```http
POST /report/generate HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  {
    "reportType": "sales",
    "parameters": { "date": "2025-02-27" },
    "callbackUrl": "https://client.example.com/report-callback"
  }
]
```

**HTTP Response**  
```http
HTTP/1.1 207 Multi-Status
Content-Type: application/json

[
  { "jobId": "abc123", "status": 202 }
]
```

This decoupled approach improves reliability and scalability for long-running processes.

## 10. Enforcing Idempotency

### Traditional REST Approach  
While certain HTTP methods are idempotent, operations that modify state (typically via POST) are not, leading to potential duplicate processing if retried.

### Challenges  
Without an explicit idempotency mechanism, clients risk accidentally processing the same request multiple times during network retries or failures.

### HyperAction API Decision  
Every state-modifying action must include an idempotency key, passed as a header (e.g., `X-Idempotency-Key`). In line with the batching principle, the endpoint accepts an array of requests, each of which will be deduplicated based on the provided key.

#### Example

**HTTP Request**  
```http
POST /account/update-email HTTP/1.1
Host: api.example.com
Content-Type: application/json
X-Idempotency-Key: 4f2a9c3e-d8f1-4b5e-9a2d-123456789abc

[
  {
    "userId": 789,
    "email": "new.email@example.com"
  }
]
```

The server uses the idempotency key to ensure that duplicate requests do not cause repeated processing.

## 11. Caching and Consistency with ETAGs

### Traditional REST Approach  
ETAGs are used for caching and concurrency but are often applied at a coarse level (e.g., per entire response), which is insufficient when handling batches.

### Challenges  
Without item-level ETAGs, clients may inadvertently overwrite data when updating parts of a batch, risking consistency issues.

### HyperAction API Decision  
Assign ETAGs to each individual item in a response. When updating items, the client includes the corresponding ETAG for each item in the batch, ensuring updates are based on the latest state.

#### Example  
Retrieving items with individual ETAGs:

**HTTP Request**  
```http
GET /item?limit=10&offset=0 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Count: 10
X-Limit: 10
X-Offset: 0

[
  { "id": 123, "name": "Item One", "etag": "a1b2c3d4" },
  { "id": 124, "name": "Item Two", "etag": "e5f6g7h8" },
  ...
]
```

When updating, the request carries an array of items with ETAGs:

**HTTP Request**  
```http
PUT /item HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  { "id": 123, "name": "Item One Updated", "etag": "a1b2c3d4" }
]
```

This mechanism minimizes race conditions and guarantees consistency for batch operations.

## 12. No API Versioning in URLs

### Traditional REST Approach  
Version numbers are commonly embedded in URLs (e.g., `/v1/users`, `v1.example.com/users`), which can lead to fragmentation and maintenance overhead.

### Challenges  
Including version numbers in the URL clutters the design and complicates the evolution of the API, especially when changes are either mandatory or better expressed through distinct endpoints.

Version numbers embedded in URLs tend to clutter the API design and force clients to hardcode endpoint paths that may rapidly become outdated. By removing version numbers from the URL and instead leveraging HTTP headers—such as the `Accept` and `Content-Type` headers—for payload negotiation, the API remains clean and adaptable. This strategy allows changes to be introduced without breaking existing client implementations, as the evolution of data formats or business rules can be communicated through header negotiation rather than through separate endpoint versions.

Additionally, relying on versioned endpoints can inadvertently signal that a fundamental business process has changed while still supporting outdated behavior. When a new version of an endpoint introduces breaking changes, it implies that the underlying business process has evolved. In such cases, maintaining the old version not only creates confusion but also contradicts the notion of a genuine process change. Either the business process has indeed changed—rendering the old endpoint obsolete and in need of removal—or a completely new business process is introduced, which should be reflected through distinct endpoint naming rather than a simple version increment.

### HyperAction API Decision  
Version numbers are removed from URLs. Instead, use HTTP headers such as `Accept` and `Content-Type` to indicate the payload format or model variant, if necessary. This keeps the endpoint clean and directs versioning concerns to header negotiations.

- [Just say no - to versioning APIs](https://www.hmeid.com/blog/just-say-no-to-versioning)
- [Don't Version Your Web API](https://www.infoq.com/news/2016/07/web-api-versioning/)
- [Versions are evil](https://av.tib.eu/media/48857)
- [REST APIs don’t need a versioning strategy - they need a change strategy](https://www.ben-morris.com/rest-apis-dont-need-a-versioning-strategy-they-need-a-change-strategy/)

#### Example

Consider a client request to the `/account/summary` endpoint that negotiates the desired payload format via the `Content-Type` and `Accept` headers rather than embedding a version number in the URL:

**HTTP Request**  
```http
GET /account/summary HTTP/1.1
Host: api.example.com
Accept: application/vnd.example.account-summary-with-balance+json
```

In a successful scenario, the server recognizes the specified version in the headers and responds with the corresponding data model:

**Successful HTTP Response**  
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.example.account-summary-with-balance+json
X-API-Status: Active

[
  {
    "accountId": 123,
    "name": "Alice",
    "balance": 250.75
  }
]
```

Alternatively, if the client submits a request using a deprecated accept type (for example, `application/vnd.example.account-summary+json`), the server can indicate that this request model is no longer supported. This response clearly communicates that the API no longer supports the outdated version, urging the client to update its request headers:

**Deprecated Request HTTP Response**  
```http
HTTP/1.1 410 Gone
Content-Type: application/json
X-API-Status: Deprecated

{
  "error": "Not Acceptable",
  "message": "The requested content type 'application/vnd.example.account-summary+json' is deprecated and no longer supported. Please update your Accept header to a supported version."
}
```
It is also acceptable for the server to respond with just the appropriate headers and a `410` status code, without any accompanying content.

Note that a draft standardizing the use of a `Deprecation` header in HTTP responses is currently underway, as described in [The Deprecation HTTP Header Field draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-deprecation-header/), and is still in active development at the time of writing this article.

## Conclusion  
The **HyperAction API** convention represents a deliberate reimagining of HTTP API design by enforcing batch processing at every endpoint and a singular naming convention throughout. By eliminating single-item endpoints, abstract pagination models, and generic resource endpoints—and by always using singular names—the API design closely aligns with the underlying business logic and operational realities. With every endpoint accepting and returning arrays of items, employing dedicated HTTP headers for metadata, explicit idempotency keys, and supporting asynchronous operations, the HyperAction API provides a robust, efficient, and clear contract between clients and servers.

Software engineers adopting these guidelines will benefit from clearer API semantics, reduced redundancy in client–server communication, and an interface that naturally mirrors the business operations it supports. This document serves as a comprehensive technical reference for designing modern HTTP APIs under the HyperAction API convention.

## Future Work & Feedback  
Please note that this whole concept is still a work in progress. I would be very happy to receive any feedback or suggestions to help refine and improve this approach.

## Appendix: Embracing Vertical Slice Architecture  
The protocol conventions presented in this document are partly inspired by the principles of [vertical slice architecture](https://www.jimmybogard.com/vertical-slice-architecture/). While this article focuses on redefining HTTP request-response protocols—such as action-oriented endpoints, batch processing, and explicit metadata handling—the underlying inspiration comes from an architectural mindset that emphasizes self-contained business features.

Vertical slice architecture is a holistic approach to software organization. It advocates for encapsulating all layers of functionality—ranging from user interface and application logic to data access—within discrete slices that correspond to individual business capabilities. This separation minimizes interdependencies and simplifies testing, maintenance, and independent evolution of features.

It is important to note that this document addresses only the HTTP protocol conventions, not the deeper aspects of code organization. The protocol decisions described here are fully compatible with, and indeed inspired by, a vertical slice approach. However, the specifics of organizing your codebase into vertical slices—covering topics such as module boundaries, dependency management, and internal service communication—fall outside the scope of this article.

We plan to publish a separate article in the future that will explore these code organization topics in detail, providing practical guidance on how to implement vertical slice architecture to complement the protocol conventions outlined here.