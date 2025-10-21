import type {
  AuthService,
  RegisterRequest,
  User,
  AuthServiceConfig,
} from '@/types';
import TokenManager from '@/services/TokenManager';

/**
 * API-based implementation of AuthService
 * Uses fetch for HTTP requests
 */
export class ApiAuthService implements AuthService {
  private baseUrl: string;
  private tokenManager: TokenManager;

  constructor(config: AuthServiceConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.tokenManager = TokenManager.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // 1. Construct the full URL using this.baseUrl and endpoint
    const url = `${this.baseUrl}${endpoint}`;

    // 2. Set up default headers including 'Content-Type': 'application/json'
    // Adds 'Content-Type': 'application/json' to provided headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 3. Use {credentials: 'include'} for session cookies
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    // 4. Make the fetch request with the provided options
    console.log("fetch options")
    console.log("fetchOptions:", fetchOptions);

    const response = await fetch(url, fetchOptions);

    // 5. Handle non-ok responses by throwing an error with status and message
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }

    // 6. Return the parsed JSON response
    const data: T = await response.json();
    return data;
  }

  async login(username: string, password: string): Promise<User> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/auth/login'
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password
      })
    }
    const response = await this.makeRequest<{ user: User; token: string }>(endpoint, options);

    // 2. Store the token using this.tokenManager.setToken(response.token)
    this.tokenManager.setToken(response.token)

    // 3. Return the user object
    return response.user
  }

  async register(userData: RegisterRequest): Promise<User> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/auth/register'
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        password: userData.password
      })
    }
    const response = await this.makeRequest<{ user: User; token: string }>(endpoint, options);

    // 2. Store the token using this.tok
    // enManager.setToken(response.token)
    this.tokenManager.setToken(response.token)

    // 3. Return the user object
    return response.user
  }

  async logout(): Promise<void> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/auth/logout'
    const options: RequestInit = {
      method: 'POST',
    }

    // 2. Handle errors gracefully (continue with logout even if API call fails)
    try {
      await this.makeRequest<{ message: string }>(endpoint, options);
    } catch (err) {
      // Continue with logout if API call fails
      // 3. Clear the token using this.tokenManager.clearToken()
      this.tokenManager.clearToken();
    }
  }

  async refreshToken(): Promise<User> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/auth/refresh'
    const options: RequestInit = {
      method: 'POST'
    }
    const response = await this.makeRequest<{ user: User; token: string }>(endpoint, options);

    // 2. Update the stored token using this.tokenManager.setToken(response.token)
    this.tokenManager.setToken(response.token)

    // 3. Return the user object
    return response.user
  }

  async getCurrentUser(): Promise<User | null> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/auth/me'
    const options: RequestInit = {
      method: 'GET'
    }
    try {
      // 2. Return the user object if successful
      const response = await this.makeRequest<User>(endpoint, options);
      return response
    } catch (err: any) {
      // 3. If the request fails (e.g., session invalid), clear the token and return null
      this.tokenManager.clearToken()
    }
    return null
  }
}
