# OSSREP Customer Portal

Self-service web application for OSSREP customers built with Angular.

## Features

### Customer Enrollment (Start Service)

A 6-step guided enrollment flow for new customers:

1. **Customer Type** - Select individual (residential) or business (commercial)
2. **Contact Information** - Personal details for individuals, business details and primary contact for businesses
3. **Service Address** - The premise address where electricity service is needed
4. **Meter Selection** - Select one or more meters at the service address to enroll
5. **Mailing Address** - Billing address (can be same as service address)
6. **Review & Terms** - Summary of enrollment details and terms acceptance

#### Meter Selection

After entering a service address, the system looks up available meters at that premise:

- Individual customers typically see a single meter
- Business customers may see multiple meters (e.g., separate meters for different buildings or units)
- Customers must select at least one meter to proceed
- Selected meters are displayed in the enrollment summary

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

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

### Development Server

To start a local development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application automatically reloads on source file changes.

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

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [OSSREP Documentation](https://ossrep.github.io)
