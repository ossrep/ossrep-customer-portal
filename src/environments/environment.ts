export const environment = {
  production: true,
  oidc: {
    issuer: 'https://auth.ossrep.io/realms/ossrep',
    clientId: 'ossrep-customer-portal',
    redirectUri: 'https://portal.ossrep.io',
    scope: 'openid profile email',
    responseType: 'code',
    showDebugInformation: false
  }
};
