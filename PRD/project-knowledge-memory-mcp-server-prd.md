# PRD --- Project Knowledge & Memory MCP Server

**Product:** Project Knowledge & Memory MCP Server\
**Version:** 2.0\
**Status:** Development Specification\
**Primary Client:** OpenCode / AREG\
**Architecture:** Self-hosted AI project knowledge and persistent memory
infrastructure\
**Backend:** NestJS\
**Database:** PostgreSQL + pgvector\
**Cache:** Redis\
**Deployment:** Docker / Dokploy / VPS\
**Protocol:** Model Context Protocol (MCP), Streamable HTTP\
**Primary Objective:** Generate structured PRDs from project summaries
and deliver only task-relevant project knowledge to coding agents,
reducing context-window usage and token consumption.

------------------------------------------------------------------------

## 1. Executive Summary

The Project Knowledge & Memory MCP Server is a self-hosted platform that
gives AI coding agents persistent, structured, project-aware knowledge
across development sessions.

The system has two complementary knowledge sources:

1.  **PRD Knowledge** --- authoritative information describing what the
    project should do, including scope, modules, requirements, business
    rules, architecture, APIs, database requirements, security
    requirements, acceptance criteria, deployment requirements, and
    other specifications.
2.  **Development Memory** --- evolving information learned during
    implementation, including decisions, conventions, known issues,
    solutions, preferences, configuration facts, and lessons from
    previous sessions.

A user can create a project by providing a short project summary. The
platform uses an LLM-backed PRD Generator to transform the summary into
a standardized development-ready Markdown PRD. The canonical Markdown
document is preserved, but it is also parsed into structured knowledge
units, embedded, indexed, and stored in PostgreSQL with pgvector.

OpenCode and other MCP-compatible clients do not receive the complete
PRD on every request. Instead, the MCP server retrieves only the
requirements, rules, architecture, decisions, and related memories
required for the current task. A token-budgeting engine limits returned
context.

The intended flow is:

``` text
Project Summary
      ↓
AI PRD Generator
      ↓
Structured Master PRD.md
      ↓
Validation / Normalization
      ↓
PRD Parser
      ↓
Structural + Semantic Chunking
      ↓
Metadata + Relationships + Embeddings
      ↓
PostgreSQL + pgvector
      ↓
Hybrid Retrieval + Context Engine
      ↓
Token Budget
      ↓
MCP
      ↓
OpenCode / AREG
```

PostgreSQL is the source of truth. pgvector provides semantic retrieval.
PostgreSQL full-text search supports exact technical search. Redis
accelerates retrieval and temporary state. MCP provides the
client-facing interface.

------------------------------------------------------------------------

## 2. Product Vision

Create a private project intelligence layer that allows AI development
agents to understand large software projects without repeatedly loading
complete PRDs, architecture documents, or previous conversations into
the active LLM context.

The platform should allow a developer to move between computers,
OpenCode sessions, and eventually different MCP-compatible AI clients
while retaining consistent project requirements and development
knowledge.

------------------------------------------------------------------------

## 3. Problem Statement

Large software projects create several problems for AI-assisted
development:

-   Full PRDs consume significant context-window capacity.
-   Repeatedly attaching project documentation wastes tokens.
-   Important requirements can disappear from the active context during
    long sessions.
-   Coding agents may make decisions that conflict with established
    architecture.
-   Knowledge from previous sessions is frequently lost.
-   Semantic search alone can miss exact requirement identifiers or
    technical names.
-   Old requirements can conflict with newer PRD versions.
-   Development decisions made after the PRD was written need persistent
    storage.
-   Generic RAG systems do not distinguish authoritative requirements
    from temporary development memories.

The product solves these problems by combining structured PRD knowledge,
persistent memory, deterministic requirement lookup, hybrid search,
relationship-aware retrieval, and token-budgeted context assembly.

------------------------------------------------------------------------

## 4. Goals

The system must provide:

-   Project creation from a short summary.
-   Automatic generation of a standardized development-ready PRD.
-   Canonical Markdown PRD storage.
-   PRD validation and normalization.
-   PRD versioning.
-   Structural and semantic PRD chunking.
-   Stable IDs for modules, features, requirements, business rules, and
    acceptance criteria.
-   PostgreSQL + pgvector knowledge storage.
-   PostgreSQL full-text search.
-   Persistent development memory.
-   Global, workspace, and project memory scopes.
-   Exact requirement lookup.
-   Semantic PRD retrieval.
-   Hybrid PRD and memory retrieval.
-   Relationship/dependency-aware context expansion.
-   Token-budgeted context assembly.
-   Project identification from normalized Git remotes.
-   OpenCode integration through MCP.
-   AREG-oriented task context.
-   API-key authentication for MCP clients.
-   JWT authentication for dashboard users.
-   Redis caching.
-   Audit/history tracking.
-   Multiple computers and MCP clients.
-   Pluggable LLM and embedding providers.
-   Secure self-hosted deployment.

------------------------------------------------------------------------

## 5. Non-Goals

V1/V2 does not aim to:

-   Replace Git as the source of truth for code.
-   Store source-code embeddings for the entire repository unless
    introduced as a later module.
-   Automatically modify production code without a client agent.
-   Depend internally on OpenCode-specific APIs.
-   Use Redis as permanent storage.
-   Send the complete PRD to the coding agent by default.
-   Treat generated PRD content as immutable.
-   Automatically approve major PRD changes without user review.
-   Build a full enterprise project-management suite.

------------------------------------------------------------------------

## 6. Primary Users

### 6.1 Developer

Creates projects, generates/uploads PRDs, connects OpenCode, stores
decisions, and retrieves project context.

### 6.2 Administrator

Manages users, embedding providers, LLM providers, projects, API keys,
platform settings, and system health.

### 6.3 MCP Client / Coding Agent

Uses authenticated MCP tools to identify projects, retrieve task
context, search project knowledge, and store development memories.

------------------------------------------------------------------------

## 7. Core Product Concepts

### 7.1 Project

A software project identified preferably by normalized Git remote.

Example:

``` text
git@github.com:company/storepilot.git
```

becomes:

``` text
github.com/company/storepilot
```

### 7.2 Workspace

Optional grouping of related projects.

Example:

``` text
cofixer
├── storepilot-api
├── storepilot-web
├── storepilot-plugin
└── holodesk
```

### 7.3 PRD Knowledge

Authoritative project specification describing intended behavior.

### 7.4 Development Memory

Dynamic project knowledge learned or decided during implementation.

### 7.5 Context Package

A curated, token-limited response assembled for a specific development
task.

------------------------------------------------------------------------

## 8. Knowledge Authority Model

The system must distinguish between specification and evolving memory.

``` text
PRD Knowledge                     Development Memory
-------------                     ------------------
What SHOULD happen                What DID happen
Requirements                      Decisions
Business rules                    New conventions
Architecture specification        Implementation discoveries
Security requirements             Known issues
Acceptance criteria               Solutions
API requirements                  Developer preferences
Database requirements             Session knowledge
```

Default authority order:

``` text
Active PRD critical requirements
        ↓
Active PRD architecture/business rules
        ↓
Explicit project rules
        ↓
Approved architectural decisions
        ↓
Project memories
        ↓
Workspace memories
        ↓
Global preferences
```

A memory must not silently override an active critical PRD requirement.
Conflicts must be surfaced.

------------------------------------------------------------------------

## 9. Project Creation Workflow

Projects can be created using:

1.  Project summary only.
2.  Existing Markdown PRD.
3.  Project summary plus existing PRD.
4.  REST API.
5.  Administration dashboard.

Summary-based flow:

``` text
Create Project
    ↓
Enter project metadata
    ↓
Enter project summary
    ↓
Select PRD generation options
    ↓
Generate draft PRD
    ↓
Validate structure
    ↓
User review / approve
    ↓
Create PRD version
    ↓
Parse + chunk
    ↓
Generate embeddings
    ↓
Create relationships
    ↓
Index FTS
    ↓
Mark version active
```

------------------------------------------------------------------------

## 10. Automatic PRD Generator

### 10.1 Purpose

Convert a concise project description into a consistent,
development-ready Markdown PRD.

### 10.2 Input

Recommended input fields:

``` text
project_name
summary
product_type
target_users
business_goals
preferred_stack
deployment_target
known_modules
known_integrations
constraints
additional_notes
```

Only `project_name` and `summary` are required.

### 10.3 Output

The generator must produce a structured Markdown document following the
platform PRD schema.

### 10.4 Generation Rules

The generator must:

-   Preserve user-provided facts.
-   Avoid inventing business-critical requirements as confirmed facts.
-   Mark uncertain generated assumptions explicitly.
-   Use stable machine-readable identifiers.
-   Produce development-oriented requirements.
-   Separate functional and non-functional requirements.
-   Include acceptance criteria where applicable.
-   Identify open questions.
-   Generate architecture sections only to the degree supported by user
    input or selected defaults.
-   Validate the resulting document before activation.

### 10.5 LLM Provider Abstraction

``` text
PrdGenerationService
    ├── OpenAI
    ├── OpenRouter
    ├── Ollama
    └── Custom Provider
```

Provider configuration must be independent from embedding configuration.

------------------------------------------------------------------------

## 11. Standard PRD Schema

Generated PRDs should normally contain the following top-level
categories:

1.  Document Information
2.  Executive Summary
3.  Product Vision & Objectives
4.  Background & Problem Statement
5.  Scope
6.  Stakeholders & User Types
7.  Product Modules & Feature Map
8.  Functional Requirements
9.  User Journeys & Workflows
10. Business Rules & Logic
11. UI/UX Requirements
12. Data & Database Requirements
13. API & Integration Requirements
14. Architecture & Technical Requirements
15. Security, Privacy & Compliance
16. Non-Functional Requirements
17. Analytics, Logging & Observability
18. Testing & Quality Assurance
19. DevOps, Infrastructure & Deployment
20. Release & Implementation Plan
21. Risks, Assumptions & Open Questions
22. Appendices & References

Not every generated project must contain substantial content in every
category. Empty categories may be omitted when configured.

------------------------------------------------------------------------

## 12. Requirement Identification Standard

Every important knowledge object must have a stable ID.

Recommended format:

``` text
{MODULE}-{TYPE}-{NUMBER}
```

Examples:

``` text
AUTH-FR-001    Functional Requirement
AUTH-BR-001    Business Rule
AUTH-AC-001    Acceptance Criterion
AUTH-SEC-001   Module Security Requirement
ORDER-FR-004
PAY-BR-003
DB-REQ-012
API-REQ-007
NFR-PERF-001
SEC-001
DEPLOY-001
```

IDs must remain stable across minor PRD edits whenever the underlying
requirement remains semantically the same.

Deleted IDs must not be reused within the same project.

------------------------------------------------------------------------

## 13. Canonical PRD Storage

The full Markdown PRD must be preserved as a canonical document.

The canonical document is used for:

-   Human review.
-   Download/export.
-   Version comparison.
-   Re-parsing.
-   Disaster recovery.
-   Regeneration of derived chunks.
-   Historical reference.

The canonical document must **not** automatically be injected in full
into OpenCode context.

------------------------------------------------------------------------

## 14. PRD Versioning

Table: `prd_documents`

Recommended fields:

``` text
id
project_id
version
title
content
content_hash
generation_source
generator_provider
generator_model
status
is_active
created_by
approved_by
approved_at
created_at
updated_at
```

Possible statuses:

``` text
draft
validating
ready
active
superseded
archived
failed
```

Only one active PRD version is allowed per project by default.

Normal retrieval searches only the active version unless a historical
version is explicitly requested.

Example:

``` text
Project
  └── PRD
      ├── v1.0 superseded
      ├── v1.1 superseded
      └── v2.0 active
```

------------------------------------------------------------------------

## 15. PRD Parser

The parser converts Markdown into structured knowledge.

It must recognize:

-   Heading hierarchy.
-   Module names.
-   Feature names.
-   Requirement IDs.
-   Requirement descriptions.
-   Business rules.
-   Acceptance criteria.
-   Security requirements.
-   Database requirements.
-   API requirements.
-   Architecture decisions.
-   Workflows.
-   Dependencies.
-   References between IDs.

Parsing must be deterministic wherever possible.

Invalid or duplicate IDs must be reported during validation.

------------------------------------------------------------------------

## 16. PRD Chunking Strategy

The system must not split documents only by arbitrary character count.

Use structural chunking first:

``` text
Document
  ↓
Section
  ↓
Module
  ↓
Feature
  ↓
Requirement / Rule / Criterion
```

If a structural unit exceeds configured token limits,
semantic/subsection chunking may be applied.

Each chunk should be independently understandable when possible.

Recommended target:

``` text
Typical chunk: 200–800 tokens
Maximum configurable chunk: 1,500 tokens
```

Chunk size is configurable.

------------------------------------------------------------------------

## 17. PRD Chunk Types

Initial `chunk_type` values:

``` text
overview
goal
scope
stakeholder
module
feature
functional_requirement
non_functional_requirement
business_rule
workflow
ui_requirement
database_requirement
api_requirement
integration_requirement
architecture
security_requirement
acceptance_criteria
analytics_requirement
testing_requirement
deployment_requirement
risk
assumption
open_question
reference
```

The enum must be extensible.

------------------------------------------------------------------------

## 18. PRD Chunk Database

Table: `prd_chunks`

Recommended fields:

``` text
id
prd_document_id
project_id
parent_chunk_id

section_id
module_id
feature_id
requirement_id

chunk_type
title
content

embedding
embedding_model
embedding_dimensions

search_vector
token_count
importance
sequence

metadata

is_active
created_at
updated_at
```

Indexes should support:

-   project filtering
-   active PRD filtering
-   requirement ID lookup
-   module filtering
-   chunk type filtering
-   full-text search
-   vector similarity

------------------------------------------------------------------------

## 19. PRD Relationships

Table: `prd_relations`

Supported relations:

``` text
parent_of
child_of
depends_on
required_by
related_to
implements
validated_by
secured_by
uses
conflicts_with
supersedes
derived_from
```

Example:

``` text
AUTH-FR-004
    ├── depends_on → AUTH-BR-002
    ├── secured_by → SEC-007
    ├── validated_by → AUTH-AC-006
    └── uses → DB-REQ-014
```

Relationships enable dependency expansion during context retrieval.

------------------------------------------------------------------------

## 20. Persistent Memory Model

Memory remains separate from PRD knowledge.

Supported memory types:

``` text
fact
rule
decision
preference
architecture
convention
dependency
configuration
workflow
issue
solution
note
```

Supported scopes:

``` text
global
workspace
project
```

Retrieval scope priority:

``` text
Project
  ↓
Workspace
  ↓
Global
```

------------------------------------------------------------------------

## 21. Memory Database

Table: `memories`

Recommended fields:

``` text
id
user_id
workspace_id
project_id
scope
type
title
content
embedding
importance
confidence
source
source_client
tags
metadata
access_count
last_accessed_at
expires_at
is_archived
is_deleted
created_at
updated_at
deleted_at
```

Importance ranges from 1 to 10.

------------------------------------------------------------------------

## 22. Memory Versioning

Table: `memory_versions`

``` text
id
memory_id
version
content
metadata
changed_by
created_at
```

Important memory changes must retain history.

------------------------------------------------------------------------

## 23. Memory Relationships

Table: `memory_relations`

Supported relations:

``` text
related_to
supersedes
depends_on
contradicts
derived_from
implements
```

This forms a lightweight knowledge graph.

------------------------------------------------------------------------

## 24. Memory Deduplication

Before saving:

``` text
new memory
    ↓
normalize
    ↓
generate embedding
    ↓
exact/semantic duplicate search
    ↓
possible duplicate?
```

Possible actions:

``` text
skip
merge
update
create_anyway
```

Default behavior should merge/update when confidence exceeds the
configured threshold.

------------------------------------------------------------------------

## 25. Memory Conflict Detection

Example:

``` text
Existing:
Use TypeORM.

New:
We migrated from TypeORM to Prisma.
```

The newer approved memory can supersede the older memory.

Superseded memories remain in history but are normally excluded from
context retrieval.

Conflicts between memory and active PRD requirements must not be
automatically resolved. They should be returned as a conflict or review
item.

------------------------------------------------------------------------

## 26. PostgreSQL + pgvector

Enable:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Embeddings are stored alongside PRD chunks and memories.

Conceptual flow:

``` text
content
   ↓
Embedding Provider
   ↓
vector
   ↓
PostgreSQL / pgvector
```

Embedding dimensions must match the selected model.

------------------------------------------------------------------------

## 27. PostgreSQL Full-Text Search

Maintain generated `tsvector` search columns with GIN indexes.

Full-text search is important for:

-   requirement IDs
-   class names
-   package names
-   BullMQ
-   TypeORM
-   WooCommerce
-   endpoint names
-   event names
-   configuration keys
-   exact technical terminology

------------------------------------------------------------------------

## 28. Embedding Provider

Use an abstraction:

``` text
EmbeddingService
    ├── OpenAI
    ├── Ollama
    ├── OpenRouter
    └── Custom Provider
```

Example:

``` env
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_BASE_URL=http://ollama:11434
```

Changing embedding model or dimensions must trigger controlled
re-indexing.

------------------------------------------------------------------------

## 29. Retrieval Strategy

Do not rely exclusively on vector similarity.

The retrieval engine should select a strategy based on query intent.

### 29.1 Deterministic Retrieval

Use direct lookup for:

``` text
AUTH-FR-003
SEC-007
API-REQ-011
```

No semantic search is required when a unique exact identifier is
provided.

### 29.2 Metadata Retrieval

Use filters for:

``` text
project
module
feature
chunk_type
version
scope
memory_type
```

### 29.3 Full-Text Retrieval

Use PostgreSQL FTS for technical terms and exact phrases.

### 29.4 Semantic Retrieval

Use pgvector for conceptual similarity.

### 29.5 Relationship Expansion

After identifying primary requirements, retrieve directly linked rules,
security requirements, database requirements, API requirements, and
acceptance criteria.

------------------------------------------------------------------------

## 30. Hybrid PRD Ranking

Conceptual PRD ranking priority:

``` text
Exact ID match
    ↓
Direct relationship
    ↓
Metadata/module match
    ↓
Full-text relevance
    ↓
Semantic similarity
    ↓
Importance
```

A configurable weighted score may be used when deterministic priority
does not resolve the result.

------------------------------------------------------------------------

## 31. Hybrid Memory Ranking

Conceptual memory score:

``` text
Final Score =
    semantic similarity
  + full-text relevance
  + scope relevance
  + importance
  + recency
  + usage relevance
```

Suggested starting weights:

``` text
Semantic similarity       45%
Full-text relevance       25%
Scope                     15%
Importance                10%
Recency                    5%
```

Weights must be configurable.

------------------------------------------------------------------------

## 32. Context Engine

The Context Engine combines PRD knowledge and dynamic memories.

Pipeline:

``` text
Task / Query
    ↓
Project Identification
    ↓
Intent Classification
    ↓
Load mandatory critical rules
    ↓
PRD deterministic lookup
    ↓
PRD hybrid search
    ↓
Memory hybrid search
    ↓
Merge candidates
    ↓
Dependency expansion
    ↓
Conflict detection
    ↓
Deduplication
    ↓
Ranking
    ↓
Token-budget calculation
    ↓
Context assembly
    ↓
Return MCP response
```

------------------------------------------------------------------------

## 33. Token Budgeting

Every high-level context retrieval tool should accept `max_tokens`.

Example:

``` json
{
  "project": "github.com/company/storepilot",
  "task": "Implement password reset endpoint",
  "max_tokens": 3000
}
```

Priority:

``` text
Critical active PRD requirements
    ↓
Direct business rules
    ↓
Relevant architecture/security
    ↓
Direct acceptance criteria
    ↓
Approved project decisions
    ↓
Relevant project memories
    ↓
Workspace/global rules
    ↓
Lower-value supporting context
```

Low-value candidates must be dropped when the budget is reached.

The server should reserve a configurable amount of budget for dependency
expansion.

------------------------------------------------------------------------

## 34. Context Response Format

`get_task_context` should return structured data rather than an
unlabelled text dump.

Example:

``` json
{
  "project": "github.com/company/storepilot",
  "prd_version": "2.0",
  "task": "Implement password reset endpoint",
  "estimated_tokens": 1870,
  "requirements": [],
  "business_rules": [],
  "architecture": [],
  "security": [],
  "database": [],
  "api": [],
  "acceptance_criteria": [],
  "decisions": [],
  "memories": [],
  "conflicts": [],
  "references": []
}
```

An optional rendered text representation may also be returned for
clients that prefer plain context.

------------------------------------------------------------------------

## 35. Core MCP Tools

### `get_task_context`

Primary AREG-oriented retrieval tool.

``` json
{
  "task": "Implement notification queue",
  "project": "github.com/company/storepilot",
  "max_tokens": 3000
}
```

### `get_project_overview`

Returns concise project identity, active PRD version, stack, major
modules, and critical rules.

### `get_prd_section`

Retrieves a named/identified PRD section.

### `get_module`

Retrieves module-level specification.

### `get_feature`

Retrieves feature-level specification.

### `get_requirement`

Exact requirement lookup.

``` json
{
  "project": "github.com/company/storepilot",
  "requirement_id": "AUTH-FR-003"
}
```

### `search_prd`

Hybrid PRD knowledge search.

### `get_business_rules`

Returns relevant business rules.

### `get_acceptance_criteria`

Returns acceptance criteria related to a requirement, feature, or task.

### `get_architecture_context`

Returns relevant architectural requirements.

### `get_database_context`

Returns relevant data/database requirements.

### `get_api_context`

Returns relevant API requirements.

### `get_security_context`

Returns relevant security requirements.

### `get_context`

General combined knowledge retrieval for backward compatibility.

### `add_memory`

Creates dynamic development memory.

### `search_memories`

Hybrid memory search.

### `list_memories`

Filtered memory listing.

### `get_memory`

Retrieves one memory.

### `edit_memory`

Updates memory and regenerates embedding if content changes.

### `delete_memory`

Soft-delete by default.

### `get_rules`

Optimized retrieval for rules, conventions, architecture, and
preferences.

### `remember_decision`

Stores an architectural/development decision with high importance.

------------------------------------------------------------------------

## 36. MCP Tool Design Requirements

All MCP tools must:

-   Validate project access.
-   Return structured errors.
-   Enforce token limits where applicable.
-   Avoid returning deleted/superseded content by default.
-   Include active PRD version where relevant.
-   Include stable IDs in responses.
-   Support future MCP clients without OpenCode-specific dependencies.
-   Keep protocol adapters separate from business services.

------------------------------------------------------------------------

## 37. OpenCode / AREG Workflow

Example:

``` text
Developer:
"Implement notification queue."

OpenCode
    ↓
get_task_context()
    ↓
MCP Context Engine
    ↓
Relevant PRD requirements
Relevant business rules
Relevant architecture
Relevant security
Relevant acceptance criteria
Relevant previous decisions
Relevant memories
    ↓
Token-budgeted package
    ↓
OpenCode / AREG implementation
```

The coding agent should request additional specific context only when
necessary.

------------------------------------------------------------------------

## 38. Example Task Context

For:

``` text
Implement notification queue.
```

The MCP server may return:

``` text
PROJECT
StorePilot API

ACTIVE PRD
v2.0

REQUIREMENTS
QUEUE-FR-003
QUEUE-FR-005

ARCHITECTURE
NestJS
BullMQ
Redis

BUSINESS RULES
QUEUE-BR-002
Retry policy: exponential
Maximum attempts: 5

SECURITY
SEC-012

ACCEPTANCE CRITERIA
QUEUE-AC-003
QUEUE-AC-004

APPROVED DECISION
Notification workers run separately.

RELEVANT MEMORY
Payment queue uses shared QueueModule.
```

The complete PRD is not included.

------------------------------------------------------------------------

## 39. Project Identification

Primary identity should come from normalized Git remote.

Resolution sequence:

``` text
Explicit project ID
    ↓
Normalized Git remote
    ↓
Repository URL
    ↓
Configured local mapping
    ↓
Project slug
```

Folder names alone should not be considered globally reliable.

------------------------------------------------------------------------

## 40. Projects Database

Table: `projects`

``` text
id
user_id
workspace_id
name
slug
git_remote
repository_url
description
summary
active_prd_id
metadata
created_at
updated_at
```

------------------------------------------------------------------------

## 41. Workspaces Database

Table: `workspaces`

``` text
id
user_id
name
slug
description
metadata
created_at
updated_at
```

A workspace may provide shared engineering standards and memories to
several projects.

------------------------------------------------------------------------

## 42. Authentication

Never expose an unauthenticated public MCP endpoint.

### 42.1 API Key Authentication

Used by MCP clients:

``` text
Authorization: Bearer mem_live_xxxxx
```

Only hashed API keys are stored.

Table: `api_keys`

``` text
id
user_id
name
key_hash
prefix
permissions
last_used_at
expires_at
created_at
revoked_at
```

Example scopes:

``` text
memory:read
memory:write
memory:delete
prd:read
project:read
```

### 42.2 JWT Authentication

Used by the dashboard.

JWT payload:

``` text
sub
email
role
```

### 42.3 Combined Auth Guard

1.  If token starts with `mem_live_`, validate as API key.
2.  Otherwise validate as JWT.
3.  Attach authenticated user to the request.

------------------------------------------------------------------------

## 43. Role-Based Access Control

Initial roles:

``` text
admin
user
```

### Admin

-   Full administration access.
-   Manage users.
-   Manage all projects.
-   Manage providers.
-   Manage API keys.
-   View system stats.
-   View audit records.

### User

-   Manage own projects.
-   Generate and manage own PRDs.
-   Manage own API keys.
-   Manage own memories.
-   Cannot access other users' project knowledge.

Backend authorization is authoritative. Client-side route protection is
supplementary.

------------------------------------------------------------------------

## 44. MCP Transport

Primary transport:

**MCP Streamable HTTP**

Primary endpoint:

``` text
POST /mcp
```

Use the official MCP TypeScript SDK where practical.

Architecture:

``` text
MCP Tool
   ↓
Application Service
   ↓
Context / PRD / Memory Service
   ↓
Repository
```

MCP code must not contain core business logic.

------------------------------------------------------------------------

## 45. REST Management API

Base path:

``` text
/api/v1
```

### Projects

``` text
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

### PRDs

``` text
POST   /projects/:id/prd/generate
POST   /projects/:id/prd/upload
GET    /projects/:id/prd
GET    /projects/:id/prd/versions
GET    /projects/:id/prd/versions/:version
POST   /projects/:id/prd/versions/:version/activate
POST   /projects/:id/prd/reindex
GET    /projects/:id/prd/chunks
GET    /projects/:id/prd/requirements/:requirementId
```

### Memories

``` text
GET    /memories
POST   /memories
GET    /memories/:id
PATCH  /memories/:id
DELETE /memories/:id
```

### API Keys

``` text
GET    /api-keys
POST   /api-keys
DELETE /api-keys/:id
```

### Admin

``` text
GET    /admin/stats
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/:id
DELETE /admin/users/:id

GET    /admin/projects
GET    /admin/memories
GET    /admin/audit-logs

GET    /admin/embedding-providers
POST   /admin/embedding-providers
PATCH  /admin/embedding-providers/:id
DELETE /admin/embedding-providers/:id

GET    /admin/llm-providers
POST   /admin/llm-providers
PATCH  /admin/llm-providers/:id
DELETE /admin/llm-providers/:id
```

------------------------------------------------------------------------

## 46. Redis

Redis is not permanent storage.

Use it for:

-   Context cache.
-   Search-result cache.
-   Authentication cache.
-   Rate limiting.
-   Temporary MCP state.
-   Distributed locks.
-   Deduplication locks.
-   Project-context cache.
-   PRD retrieval cache.
-   Generation job state where appropriate.

Example keys:

``` text
context:{project}:{hash}
prd:search:{project}:{version}:{hash}
memory:search:{project}:{hash}
auth:key:{hash}
rate:{apiKey}:{minute}
```

PRD activation, re-indexing, memory mutation, and relationship changes
must invalidate affected caches.

------------------------------------------------------------------------

## 47. Background Jobs

BullMQ is recommended for long-running operations:

``` text
prd-generation
prd-parsing
prd-embedding
prd-reindex
memory-embedding
bulk-embedding
cleanup
```

Jobs must be idempotent where practical.

Large PRD ingestion must not block HTTP request threads.

------------------------------------------------------------------------

## 48. NestJS Module Structure

Recommended structure:

``` text
src/
├── app.module.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── api-keys/
│   ├── workspaces/
│   ├── projects/
│   ├── prd/
│   │   ├── prd.module.ts
│   │   ├── prd.service.ts
│   │   ├── prd-generation.service.ts
│   │   ├── prd-parser.service.ts
│   │   ├── prd-validator.service.ts
│   │   ├── prd-version.service.ts
│   │   ├── prd-chunk.service.ts
│   │   ├── prd-relation.service.ts
│   │   └── dto/
│   ├── memories/
│   ├── search/
│   │   ├── search.service.ts
│   │   ├── semantic-search.service.ts
│   │   ├── fulltext-search.service.ts
│   │   ├── deterministic-search.service.ts
│   │   └── hybrid-ranking.service.ts
│   ├── embeddings/
│   │   ├── embedding.service.ts
│   │   └── providers/
│   ├── llm/
│   │   ├── llm.service.ts
│   │   └── providers/
│   ├── context/
│   │   ├── context.service.ts
│   │   ├── task-context.service.ts
│   │   ├── ranking.service.ts
│   │   ├── dependency-expansion.service.ts
│   │   ├── conflict.service.ts
│   │   └── token-budget.service.ts
│   ├── mcp/
│   │   ├── mcp.module.ts
│   │   ├── mcp.controller.ts
│   │   ├── mcp.service.ts
│   │   └── tools/
│   ├── cache/
│   ├── jobs/
│   ├── audit/
│   └── health/
├── database/
│   ├── migrations/
│   └── entities/
└── common/
    ├── guards/
    ├── decorators/
    ├── filters/
    ├── interceptors/
    └── utils/
```

------------------------------------------------------------------------

## 49. Dashboard Requirements

The administration/user dashboard should provide:

### User Features

-   Login.
-   Project list.
-   Create project.
-   Project summary editor.
-   Generate PRD.
-   Upload existing Markdown PRD.
-   PRD preview.
-   PRD version history.
-   Activate version.
-   Re-index PRD.
-   Browse requirements.
-   Search PRD.
-   Browse/manage memories.
-   API key management.
-   MCP connection instructions.

### Admin Features

-   Platform statistics.
-   User management.
-   Project management.
-   Memory inspection.
-   Audit logs.
-   Embedding provider management.
-   LLM provider management.
-   System settings.

------------------------------------------------------------------------

## 50. PRD Validation

Before activation, validation should check:

-   Valid Markdown structure.
-   Required project metadata.
-   Duplicate IDs.
-   Invalid ID format.
-   Broken requirement references.
-   Missing referenced dependencies.
-   Excessively large chunks.
-   Empty critical requirements.
-   Unsupported chunk types.
-   Invalid version state.
-   Embedding/index completeness.

Validation results must contain errors and warnings separately.

A PRD with blocking errors cannot become active.

------------------------------------------------------------------------

## 51. PRD Update Workflow

Recommended update process:

``` text
Active PRD v1.2
    ↓
Create draft v1.3
    ↓
Edit/regenerate
    ↓
Validate
    ↓
Diff against v1.2
    ↓
Review
    ↓
Approve
    ↓
Parse/index
    ↓
Activate v1.3
    ↓
Invalidate caches
    ↓
v1.2 becomes superseded
```

Minor edits should attempt to preserve stable requirement IDs.

------------------------------------------------------------------------

## 52. PRD Diff

The platform should provide structured version differences:

``` text
added requirements
changed requirements
removed requirements
changed business rules
changed acceptance criteria
changed architecture
changed security requirements
```

This feature may be implemented after the initial MVP but the schema
must support it.

------------------------------------------------------------------------

## 53. Conflict Handling

Possible conflict classes:

``` text
memory_vs_memory
memory_vs_prd
prd_internal
version_conflict
```

Example:

``` text
PRD:
Use TypeORM.

Memory:
Project migrated to Prisma.
```

Response should identify both sources and require explicit resolution
rather than silently selecting the memory.

------------------------------------------------------------------------

## 54. Security Requirements

-   HTTPS required in production.
-   PostgreSQL and Redis must remain private.
-   API keys stored only as secure hashes.
-   Secrets never logged.
-   JWT/API-key permissions enforced server-side.
-   Validate MCP Origin where appropriate.
-   Rate-limit public endpoints.
-   Validate uploaded Markdown.
-   Enforce maximum upload size.
-   Prevent cross-user project access.
-   Sanitize log metadata.
-   Use parameterized database queries.
-   Protect provider API keys.
-   Audit sensitive operations.
-   Soft-delete by default where history is required.
-   Support key revocation.
-   Support configurable token expiration.
-   Do not expose raw embedding-provider credentials to clients.

------------------------------------------------------------------------

## 55. Non-Functional Requirements

### Performance

-   Exact requirement lookup should normally complete in under 200 ms
    excluding network latency.
-   Cached context retrieval should normally complete in under 500 ms.
-   Non-cached hybrid retrieval should target under 2 seconds excluding
    slow external embedding calls.
-   Long-running generation/indexing must run asynchronously.

### Scalability

Architecture should support:

-   Multiple projects per user.
-   Hundreds of thousands of chunks/memories.
-   Horizontal NestJS scaling.
-   Shared Redis.
-   PostgreSQL connection pooling.

### Reliability

-   PostgreSQL is authoritative.
-   Failed indexing jobs must be retryable.
-   Partial PRD indexing must not activate an incomplete version.
-   Health endpoints must expose dependency readiness.

### Maintainability

-   Provider abstractions.
-   Modular NestJS architecture.
-   Database migrations.
-   Typed DTOs.
-   Automated tests.
-   Structured logging.

------------------------------------------------------------------------

## 56. Observability

Provide:

``` text
GET /health
GET /health/ready
GET /health/live
```

Checks should cover:

-   NestJS.
-   PostgreSQL.
-   Redis.
-   Embedding provider.
-   LLM provider where configured.
-   Queue system.

Structured logs should include:

``` text
request_id
user_id where safe
client
project
prd_version
mcp_tool
duration
candidate_count
returned_chunk_count
estimated_tokens
cache_hit
```

Sensitive memory/PRD content should not be logged by default.

------------------------------------------------------------------------

## 57. Audit Log

Table: `audit_logs`

Track:

``` text
project.created
project.updated
prd.generated
prd.uploaded
prd.validated
prd.activated
prd.reindexed
prd.archived
memory.created
memory.updated
memory.deleted
memory.recalled
api_key.created
api_key.revoked
provider.updated
```

Include:

``` text
actor
client
ip
timestamp
resource_type
resource_id
safe_metadata
```

------------------------------------------------------------------------

## 58. Deployment Architecture

Recommended topology:

``` text
                    Internet
                       │
                       ▼
                   Cloudflare
                       │
                       ▼
                     HTTPS
                       │
                       ▼
                    Traefik
                       │
                       ▼
             memory.yourdomain.com
                       │
             ┌─────────┴──────────┐
             │ NestJS MCP/API     │
             └─────────┬──────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
     PostgreSQL       Redis       Worker(s)
     + pgvector                    BullMQ
```

Optional local/self-hosted providers:

``` text
Worker/API
   ├── Ollama embedding service
   └── Ollama/other LLM service
```

Only HTTPS should be publicly accessible.

------------------------------------------------------------------------

## 59. Environment Variables

Example:

``` env
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://...
REDIS_URL=redis://redis:6379

MCP_BASE_URL=https://memory.example.com

JWT_SECRET=...
API_KEY_SECRET=...

EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_BASE_URL=http://ollama:11434

LLM_PROVIDER=openrouter
LLM_MODEL=...
LLM_BASE_URL=...
LLM_API_KEY=...

MEMORY_DEFAULT_LIMIT=20
CONTEXT_MAX_TOKENS=5000
PRD_CHUNK_TARGET_TOKENS=600
PRD_CHUNK_MAX_TOKENS=1500

CACHE_TTL=300

RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

Secrets must never be committed or logged.

------------------------------------------------------------------------

## 60. Database Entities

Core entities:

``` text
users
api_keys
workspaces
projects

prd_documents
prd_chunks
prd_relations

memories
memory_versions
memory_relations

embedding_providers
llm_providers

audit_logs
```

Optional later entities:

``` text
context_requests
retrieval_feedback
prd_generation_jobs
project_files
knowledge_sources
```

------------------------------------------------------------------------

## 61. Database Relationship Overview

``` text
User
 ├── Workspaces
 ├── Projects
 │    ├── PRD Documents
 │    │     ├── PRD Chunks
 │    │     └── PRD Relations
 │    └── Memories
 │          ├── Memory Versions
 │          └── Memory Relations
 └── API Keys
```

------------------------------------------------------------------------

## 62. Testing Strategy

Required testing categories:

### Unit Tests

-   PRD parser.
-   ID validator.
-   Chunker.
-   Token budget.
-   Ranking.
-   Project normalization.
-   Conflict detection.
-   Deduplication.

### Integration Tests

-   PostgreSQL repositories.
-   pgvector search.
-   FTS.
-   Redis caching.
-   BullMQ jobs.
-   Provider adapters.

### API Tests

-   Authentication.
-   Authorization.
-   Project CRUD.
-   PRD generation/upload/versioning.
-   Memory CRUD.

### MCP Tests

-   Tool discovery.
-   Input validation.
-   Authentication.
-   `get_task_context`.
-   Exact requirement retrieval.
-   Search behavior.
-   Token limits.

### End-to-End Tests

``` text
Create project
→ generate PRD
→ approve
→ index
→ connect MCP
→ request task context
→ add decision
→ reconnect from another session
→ retrieve decision
```

### Retrieval Quality Tests

Maintain benchmark queries and expected relevant requirements.

Measure:

-   Recall.
-   Precision.
-   irrelevant-context rate.
-   token usage.
-   latency.

------------------------------------------------------------------------

## 63. Acceptance Criteria --- Core Platform

### AC-CORE-001

A user can create a project from a short summary.

### AC-CORE-002

The system can generate a structured Markdown PRD using the configured
LLM provider.

### AC-CORE-003

The generated PRD can be validated, versioned, and activated.

### AC-CORE-004

The active PRD is parsed into independently retrievable structured
chunks.

### AC-CORE-005

Every chunk is associated with its project and PRD version.

### AC-CORE-006

Exact requirement IDs can be retrieved without semantic search.

### AC-CORE-007

Natural-language PRD queries use hybrid retrieval.

### AC-CORE-008

Task context can combine PRD knowledge and development memories.

### AC-CORE-009

Returned context respects `max_tokens`.

### AC-CORE-010

The full PRD is not automatically returned during normal task-context
retrieval.

### AC-CORE-011

OpenCode can access the service through authenticated MCP Streamable
HTTP.

### AC-CORE-012

A decision stored from one client/session can be retrieved from another
client/session.

### AC-CORE-013

Only the active PRD version is used by default.

### AC-CORE-014

PRD/memory conflicts are surfaced instead of silently overridden.

------------------------------------------------------------------------

## 64. MVP Scope

### Phase 1 --- Foundation

-   NestJS application.
-   PostgreSQL + pgvector.
-   Redis.
-   Authentication.
-   Users.
-   Projects.
-   API keys.
-   Docker/Dokploy.
-   Health checks.

### Phase 2 --- Memory Engine

-   Memory CRUD.
-   Scopes.
-   Embeddings.
-   Vector search.
-   FTS.
-   Hybrid ranking.
-   Deduplication.
-   Token budgeting.

### Phase 3 --- PRD Knowledge Engine

-   PRD upload.
-   PRD canonical storage.
-   PRD versioning.
-   Parser.
-   Validator.
-   Structural chunking.
-   Embeddings.
-   FTS.
-   Requirement IDs.
-   Exact lookup.
-   PRD hybrid search.

### Phase 4 --- Context + MCP

-   MCP Streamable HTTP.
-   `get_task_context`.
-   `get_project_overview`.
-   `get_requirement`.
-   `search_prd`.
-   Memory MCP tools.
-   Dependency expansion.
-   Context assembly.

### Phase 5 --- Automatic PRD Generation

-   LLM provider abstraction.
-   Summary → PRD.
-   Generation validation.
-   Preview/review.
-   Activation.

### Phase 6 --- Dashboard

-   Project management.
-   PRD management.
-   Version history.
-   Search.
-   Memories.
-   API keys.
-   Provider settings.
-   Admin screens.

------------------------------------------------------------------------

## 65. Post-MVP Roadmap

Potential later features:

-   PRD structured diff UI.
-   Automatic relationship inference.
-   Retrieval feedback learning.
-   Context quality analytics.
-   Source-code knowledge ingestion.
-   Git commit/branch awareness.
-   Issue tracker integration.
-   Automatic memory extraction from coding sessions.
-   Team permissions.
-   Organization accounts.
-   Webhooks.
-   Additional document types.
-   Architecture Decision Record ingestion.
-   Repository documentation ingestion.
-   Knowledge expiration policies.
-   Reranking models.
-   Multi-agent shared memory.
-   Client-specific context profiles.

------------------------------------------------------------------------

## 66. Success Metrics

V1/V2 is successful when:

1.  A developer can create a project from a summary and obtain a usable
    standardized PRD.
2.  The PRD can be stored, versioned, parsed, embedded, and indexed
    without manual chunk creation.
3.  OpenCode can retrieve only task-relevant project knowledge through
    MCP.
4.  Typical development tasks require substantially fewer PRD context
    tokens than sending the full document.
5.  Exact requirement IDs return deterministic results.
6.  Natural-language queries return relevant requirements through hybrid
    retrieval.
7.  Development decisions persist between sessions and computers.
8.  Old PRD versions do not contaminate normal retrieval.
9.  Critical PRD requirements are prioritized within context budgets.
10. The platform remains client-independent and standards-compliant.

------------------------------------------------------------------------

## 67. Key Architectural Principles

1.  **PostgreSQL is the source of truth.**
2.  **The canonical PRD is preserved, but normal agent retrieval is
    chunk-based.**
3.  **PRD knowledge and development memory are separate but jointly
    retrievable.**
4.  **Exact identifiers use deterministic lookup before semantic
    search.**
5.  **Semantic search is combined with full-text and metadata search.**
6.  **Relationships expand context only when relevant.**
7.  **Active PRD versions control authoritative specification
    retrieval.**
8.  **Token budgeting is a core product feature, not an afterthought.**
9.  **Redis accelerates the system but never owns authoritative data.**
10. **MCP adapters remain separate from application/business logic.**
11. **OpenCode is the first client, not an internal dependency.**
12. **Generated assumptions must be distinguishable from user-confirmed
    requirements.**

------------------------------------------------------------------------

## 68. Example End-to-End Scenario

A developer creates a project:

``` text
Name:
Hospital Management System

Summary:
A single-hospital management platform with OPD, IPD, diagnostics,
billing, inventory, HR/payroll, accounting, reports and role-based access.

Stack:
NestJS, PostgreSQL, Redis, React

Deployment:
Docker / Dokploy / VPS
```

The server:

``` text
1. Creates project
2. Generates draft PRD
3. Assigns stable requirement IDs
4. Validates PRD
5. User approves
6. Stores canonical Markdown
7. Creates active PRD version
8. Parses structural knowledge
9. Creates chunks
10. Generates embeddings
11. Builds FTS index
12. Creates requirement relationships
13. Invalidates project caches
```

Later the developer asks OpenCode:

``` text
Implement IPD discharge billing.
```

OpenCode calls:

``` json
{
  "project": "github.com/company/hms",
  "task": "Implement IPD discharge billing",
  "max_tokens": 3000
}
```

The MCP server retrieves only:

``` text
IPD discharge requirements
billing business rules
relevant patient/admission data model
relevant API requirements
permissions/security rules
acceptance criteria
approved billing decisions
related previous implementation memories
```

The agent does not receive unrelated laboratory, HR, inventory, or
website requirements.

This is the core token-saving behavior of the platform.

------------------------------------------------------------------------

## 69. Definition of Done

The product is development-ready when:

-   Database migrations exist for all MVP entities.
-   NestJS modules are implemented with tests.
-   PostgreSQL + pgvector retrieval works.
-   Redis caching works with invalidation.
-   PRD upload and generation both work.
-   PRD versions can be activated safely.
-   Parser and validator produce deterministic results.
-   Hybrid retrieval is benchmarked.
-   MCP tools are authenticated and standards-compliant.
-   `get_task_context` respects token budgets.
-   OpenCode can use the remote MCP endpoint.
-   Cross-session memory persistence is verified.
-   Deployment is reproducible through Docker/Dokploy.
-   Health, logging, audit, and basic operational documentation are
    complete.

------------------------------------------------------------------------

## 70. Final Product Principle

> **Store the complete project knowledge once; retrieve only what the
> agent needs now.**

The platform should function as a central private knowledge layer for
AI-assisted software development:

``` text
Project Summary
      ↓
Structured PRD
      ↓
Project Knowledge
      +
Persistent Development Memory
      ↓
Hybrid + Relationship-Aware Retrieval
      ↓
Token-Budgeted Context
      ↓
MCP
      ↓
OpenCode / AREG / Future AI Clients
```

This architecture keeps project requirements persistent and
authoritative while minimizing repeated context, reducing token usage,
and improving consistency across AI coding sessions.
