# Mobile Best Practices

Best practices for StorePilot mobile development.

## Performance

- Use `FlatList` or `SectionList` for long lists
- Optimize images with proper dimensions
- Lazy load screens with React Navigation
- Use `React.memo` for expensive components
- Debounce search inputs

## State Management

- Server state → TanStack Query
- Global client state → Zustand
- Local UI state → useState/useReducer
- Form state → react-hook-form

## Network

- Handle offline gracefully
- Retry failed requests with backoff
- Show network status indicator
- Cache critical data

## Storage

- SecureStore for tokens
- AsyncStorage for preferences
- SQLite for offline data
- Clear cache on logout

## Navigation

- Deep linking for external URLs
- Handle back button correctly
- Preserve scroll position
- Pass minimal data between screens

## Testing

- Unit tests with Jest
- Component tests with React Native Testing Library
- E2E tests with Detox
- Test on real devices before release

## Accessibility

- Screen reader labels
- Sufficient touch targets (44x44pt)
- Dynamic type support
- High contrast support
