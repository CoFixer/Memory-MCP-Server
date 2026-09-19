# Mobile Authentication

How authentication works in the StorePilot mobile app.

## Flow

1. User logs in with email/password or social auth
2. Backend returns JWT token + refresh token
3. Mobile app stores tokens securely (Keychain/Keystore)
4. Access token sent with every API request
5. Token refreshed automatically when near expiry

## Implementation

### Secure Storage

```typescript
// lib/secure-storage.ts
import * as SecureStore from 'expo-secure-store';

export async function setToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken() {
  return SecureStore.getItemAsync('auth_token');
}

export async function removeToken() {
  await SecureStore.deleteItemAsync('auth_token');
}
```

### API Client

```typescript
// lib/api.ts
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      await removeToken();
      // Navigate to login
    }
  }
  
  return response;
}
```

### Biometric Auth

```typescript
// hooks/use-biometric.ts
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometric() {
  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
    });
    return result.success;
  };
  
  return { authenticate };
}
```

## Notes

- Use Keychain (iOS) and Keystore (Android) for token storage
- Implement token refresh with backoff
- Support biometric authentication
- Handle app background/foreground state
