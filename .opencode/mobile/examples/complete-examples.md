# Mobile Examples

Complete examples for common mobile patterns.

## Screen with Data Fetching

```typescript
// screens/OrdersScreen.tsx
import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl } from 'react-native';

export function OrdersScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
  
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <OrderCard order={item} />}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      keyExtractor={(item) => item.id}
    />
  );
}
```

## Form with Validation

```typescript
// screens/ProfileScreen.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

export function ProfileScreen() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = form.handleSubmit((data) => {
    updateProfile(data);
  });
  
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        onChangeText={(text) => form.setValue('name', text)}
      />
      {form.formState.errors.name && (
        <Text style={styles.error}>{form.formState.errors.name.message}</Text>
      )}
      <Button title="Save" onPress={onSubmit} />
    </View>
  );
}
```

## Navigation with Params

```typescript
// navigation/types.ts
type RootStackParamList = {
  Products: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

// screens/ProductDetailScreen.tsx
import { RouteProp, useRoute } from '@react-navigation/native';

export function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
  });
  
  return (
    <View>
      <Text>{product?.name}</Text>
    </View>
  );
}
```
