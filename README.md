# OSSREP Customer Portal

Self-service web application for OSSREP customers built with Angular.

## Features

### Customer Enrollment (Start Service)

A 7-step guided enrollment flow for new customers:

1. **Customer Type** - Select individual (residential) or business (commercial)
2. **Contact Information** - Personal details for individuals, business details and primary contact for businesses
3. **Service Address & Start Date** - The premise address and requested service start date
4. **Plan Selection** - Choose an electricity plan based on rate, term, and features
5. **Meter Selection** - Select one or more meters at the service address to enroll
6. **Mailing Address** - Billing address (can be same as service address)
7. **Review & Terms** - Summary of enrollment details, contract dates, and terms acceptance
8. **Confirmation Page** - Enrollment complete with full summary and next steps

#### Plan Selection

After entering a service address, available plans for that location are displayed with:

- Rate per kWh and base monthly charge
- Contract term length (month-to-month to 24 months)
- Renewable energy percentage (wind, solar)
- Early termination fees (if applicable)
- Links to plan documents (EFL, TOS, YRAC)

#### Meter Selection

After selecting a plan, the system looks up available meters at the premise:

- Individual customers typically see a single meter
- Business customers may see multiple meters (e.g., separate meters for different buildings or units)
- Customers must select at least one meter to proceed
- Selected meters are displayed in the enrollment summary

#### Contract Details

Upon completing enrollment, a contract is created with:

- **Start Date** - Customer-requested service start date
- **End Date** - Calculated from start date + plan term length
- **Plan** - The selected electricity plan
- **Accounts** - The account(s) covered by the contract
- **Early Termination Fee** - Fee if cancelled before end date (from plan)

#### Confirmation Page

After successful enrollment submission, customers are redirected to a confirmation page showing:

- Unique confirmation number
- Complete enrollment summary (customer info, address, plan, contract dates, meters)
- "What Happens Next" timeline (confirmation email, service activation, first bill)
- Print summary option for records
- Link to sign in to their new account

### Dashboard

Aggregated view across all customer accounts:

- Total balance due with next due date
- Account, premise, and meter counts
- Usage summary by meter type
- Quick access to billing and payment

### Account Management

- View all accounts with current balances
- Premises with address details
- Meter information and reading history

### Profile & Preferences

- Update contact information
- Manage mailing address
- Set communication preferences (email, mail, or both)
- Configure notification settings

## Architecture

### Backend Integration

The portal integrates with the `ossrep-customer-service` backend API:

| Endpoint | Description |
|----------|-------------|
| `GET /api/customer` | Current authenticated customer profile |
| `GET /api/accounts` | Customer's accounts with premises and meters |
| `GET /api/contracts` | Customer's contracts |
| `GET /api/plans` | Available electricity plans (public) |

### Authentication

- OIDC authentication via Keycloak
- Bearer token automatically added to API requests via HTTP interceptor
- Customer data loaded after successful authentication

### Environment Configuration

| Variable | Development | Production |
|----------|-------------|------------|
| `apiUrl` | `http://localhost:8080/api` | `https://api.ossrep.io/api` |
| `oidc.issuer` | `http://localhost:8180/realms/ossrep` | `https://auth.ossrep.io/realms/ossrep` |
| `oidc.clientId` | `ossrep-customer-portal` | `ossrep-customer-portal` |

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

### Prerequisites

- Node.js (Latest LTS)
- Angular CLI (`npm install -g @angular/cli`)
- Running backend services (see below)

### Starting Backend Services

Start the required infrastructure with podman-compose:

```bash
cd ../ossrep.github.io
podman-compose up -d
```

This starts PostgreSQL, Keycloak, and Kafka. Then start the customer service:

```bash
cd ../ossrep-customer-service
./mvnw quarkus:dev
```

### Development Server

To start the portal:

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`. The application automatically reloads on source file changes.

### Test Users

| Username | Password | Type |
|----------|----------|------|
| alice | password | Individual customer |
| bob | password | Individual customer |

### Code Scaffolding

Generate new components:

```bash
ng generate component component-name
```

For available schematics:

```bash
ng generate --help
```

### Building

```bash
ng build
```

Build artifacts are stored in the `dist/` directory. Production builds are optimized for performance.

### Running Tests

Unit tests with [Vitest](https://vitest.dev/):

```bash
ng test
```

End-to-end tests:

```bash
ng e2e
```

## Project Structure

```
src/
├── app/
│   ├── guards/              # Route guards (auth, guest)
│   ├── models/              # TypeScript interfaces
│   ├── pages/               # Page components
│   │   ├── dashboard/       # Main dashboard
│   │   ├── account/         # Account management
│   │   ├── login/           # Login page
│   │   ├── signup/          # Enrollment flow
│   │   └── index/           # Landing page
│   ├── services/            # Angular services
│   │   ├── auth.service.ts       # OIDC authentication
│   │   ├── auth.interceptor.ts   # Bearer token injection
│   │   └── customer.service.ts   # Customer data API
│   └── shared/              # Shared components
├── environments/            # Environment configuration
└── styles.scss              # Global styles
```

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [OSSREP Documentation](https://ossrep.github.io)
- [Customer Service API](../ossrep-customer-service/README.md)
