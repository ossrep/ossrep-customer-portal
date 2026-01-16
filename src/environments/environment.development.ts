export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  oidc: {
    issuer: 'http://localhost:8180/realms/ossrep',
    clientId: 'ossrep-customer-portal',
    redirectUri: 'http://localhost:4200',
    scope: 'openid profile email',
    responseType: 'code',
    showDebugInformation: true
  }
};
