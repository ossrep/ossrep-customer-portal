import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  private _isAuthenticated = signal(false);
  private _userProfile = signal<UserProfile | null>(null);
  private _isLoading = signal(true);
  private _initError = signal<string | null>(null);
  private discoveryLoaded = false;

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly initError = this._initError.asReadonly();

  readonly userDisplayName = computed(() => {
    const profile = this._userProfile();
    if (!profile) return '';
    return profile.name || profile.preferredUsername || profile.email || '';
  });

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth(): void {
    const authConfig: AuthConfig = {
      issuer: environment.oidc.issuer,
      clientId: environment.oidc.clientId,
      redirectUri: environment.oidc.redirectUri,
      scope: environment.oidc.scope,
      responseType: environment.oidc.responseType,
      showDebugInformation: environment.oidc.showDebugInformation,
      strictDiscoveryDocumentValidation: false
    };

    this.oauthService.configure(authConfig);

    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.updateAuthState();
      }
    });

    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.discoveryLoaded = true;
      this._initError.set(null);
      this.updateAuthState();
      this._isLoading.set(false);
    }).catch(error => {
      console.error('OIDC initialization failed:', error);
      this._initError.set('Unable to connect to authentication server. Please ensure Keycloak is running.');
      this._isLoading.set(false);
    });
  }

  private updateAuthState(): void {
    const isAuthenticated = this.oauthService.hasValidAccessToken();
    this._isAuthenticated.set(isAuthenticated);

    if (isAuthenticated) {
      const claims = this.oauthService.getIdentityClaims() as OidcClaims;
      if (claims) {
        this._userProfile.set({
          sub: claims.sub,
          email: claims.email,
          name: claims.name,
          preferredUsername: claims.preferred_username,
          givenName: claims.given_name,
          familyName: claims.family_name
        });
      }
    } else {
      this._userProfile.set(null);
    }
  }

  async login(): Promise<void> {
    if (!this.discoveryLoaded) {
      try {
        await this.oauthService.loadDiscoveryDocument();
        this.discoveryLoaded = true;
        this._initError.set(null);
      } catch (error) {
        console.error('Failed to load discovery document:', error);
        this._initError.set('Unable to connect to authentication server. Please ensure Keycloak is running and the realm is configured.');
        return;
      }
    }
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.customerService.clearData();
    this.oauthService.logOut();
    this._isAuthenticated.set(false);
    this._userProfile.set(null);
    this.router.navigate(['/']);
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  hasRole(role: string): boolean {
    const token = this.oauthService.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.realm_access?.roles || [];
      return roles.includes(role);
    } catch {
      return false;
    }
  }
}

interface OidcClaims {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}

export interface UserProfile {
  sub: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
}
