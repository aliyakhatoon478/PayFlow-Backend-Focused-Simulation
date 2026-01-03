# PayFlow – Backend-Focused Payment Processing Simulation

## Overview
PayFlow is a backend-focused payment processing simulation built to demonstrate how real-world payment systems handle **idempotency**, **retries**, and **payment state transitions**.
The project intentionally prioritizes **business logic correctness** over infrastructure or UI complexity. A minimal UI is used only to visualize backend behavior and state changes.


## Problem Being Solved
In real payment systems, duplicate requests can occur due to:
- Network retries
- Client-side resubmissions
- Timeouts after partial failures

If not handled correctly, these situations can lead to **double charging**.  
PayFlow demonstrates how **idempotency keys** are used to safely prevent such issues.


## Key Backend Concepts Demonstrated
- Idempotent payment request handling
- Payment lifecycle management (`INITIATED`, `SUCCESS`, `FAILED`)
- Retry-safe business logic
- Deterministic success and failure handling
- Backend-first system design thinking


## How Idempotency Works
Each payment request includes a unique **idempotency key**.

- A new idempotency key results in a new payment being created  
- Reusing the same key returns the existing payment instead of creating a duplicate  
- This guarantees safety even when requests are retried multiple times  


## Payment States
Each payment follows a clearly defined lifecycle:
- `INITIATED` – Payment request accepted
- `SUCCESS` – Payment completed successfully
- `FAILED` – Payment failed deterministically

These states model real payment workflows and help reason about failure scenarios.


## Failure Scenarios Considered
- Duplicate payment submissions
- Client retries after network issues
- Partial failures during request processing

The system ensures correctness without creating duplicate payments.


## Tech Stack & Backend Skills Demonstrated

### Backend Concepts
- Payment domain modeling
- Idempotent request handling
- Retry-safe business logic
- Payment state management
- Deterministic failure handling
- Backend-first system design

### Implementation
- TypeScript (used to implement backend-style business logic)
- In-memory data simulation for payment records
- Clear separation between business logic and UI layer

### Frontend (Supporting Role)
- React (used minimally to visualize backend payment flows and state transitions)


## What This Project Is
- A **backend-focused payment logic simulation**
- Designed to model correctness and reliability in payment flows
- Inspired by real-world fintech payment systems


## What This Project Is Not
- Not a production payment gateway
- No real money movement
- No external payment provider integrations
- No production-grade persistence or infrastructure


## Why This Project
This project was built to understand and demonstrate **core backend principles used in payment systems**, particularly idempotency and failure-safe design, which are critical in large-scale fintech platforms.
