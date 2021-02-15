# TicketingApp

Sale and purchase tickets

## Main function

Users can list a ticket for an event(concert, sports) for sale

Other users can purchase this ticket

Any user can list tickets for sale and purchase, pay for tickets

When a user attempts to purchase a ticket, the ticket is 'locked' for 15 minutes. The user has 15 minutes to enter their payment info.

While locked, no other user can purchase the ticket. After 15 minutes, the ticket should 'unlock'

Ticket prices can be edited if they are not locked.

## Stack

- Docker, Kubernetes,
- Server-side: Typescripts, Node.js, Express
  - Code Sharing: Npm.js
  - Database Driver: Mongoose
  - Authentication: JWT, Cookie-Session
  - NATS Streaming: Stan.js
  - Job Queue: Bull
  - Payments: Stripe
- Front-end: React.js, Next.js
- Code share: NPM
- Database: MongoDB
- Tests: Jest, RestSharp(.net)
- CI/CD: Github Action, Travis
- Cloud: Digital Ocean Kubernetes Clusters
- Local Kubernetes Tool: Skaffold
