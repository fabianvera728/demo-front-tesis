# Mock API System

Este directorio contiene un sistema de mock para simular un backend y permitir el desarrollo frontend sin necesidad de un backend real.

## Estructura

- `mockData.ts`: Contiene los datos de mock (usuarios, datasets, etc.).
- `mockAuthService.ts`: Implementa los servicios de autenticación (login, registro, etc.).
- `mockDatasetService.ts`: Implementa los servicios de datasets (listar, crear, actualizar, etc.).
- `mockApiClient.ts`: Implementa un cliente API que intercepta las llamadas y devuelve datos de mock.
- `index.ts`: Exporta todos los mocks para facilitar su importación.

## Cómo funciona

El sistema de mock está integrado en el archivo `src/services/apiClient.ts`. Hay una bandera `USE_MOCK_API` que determina si se debe usar el mock API o el API real.

```typescript
// Flag to determine if we should use mock API
const USE_MOCK_API = true; // Set to false when you have a real backend

// Type-safe API client
export const apiClient = USE_MOCK_API
  ? mockApiClient
  : {
      // Real API client implementation
    };
```

## Datos de prueba

### Usuarios

- Email: `demo@demo.com.co`, Password: `demo`
- Email: `admin@example.com`, Password: `admin123`

### Datasets

El sistema incluye 3 datasets de ejemplo:
1. Sales Data 2023
2. Customer Feedback
3. Website Analytics

## Cómo usar

Para usar el sistema de mock, simplemente importa y usa el `apiClient` como lo harías normalmente. El sistema de mock interceptará las llamadas y devolverá datos de mock.

```typescript
import { apiClient } from '@/services/apiClient';

// Esto usará el mock API si USE_MOCK_API es true
const datasets = await apiClient.get('/datasets');
```

## Desactivar el mock

Para desactivar el sistema de mock y usar un backend real, simplemente cambia la bandera `USE_MOCK_API` a `false` en el archivo `src/services/apiClient.ts`.

```typescript
const USE_MOCK_API = false;
``` 