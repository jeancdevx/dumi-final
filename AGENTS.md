# AGENTS.md

Contexto operativo para futuros agentes trabajando en este repo.

## Producto

Esta app es el frontend administrativo de Telar, orientado a empresas que
producen ropa. El usuario dueño del proyecto es backend/cloud y conoce a fondo
el backend e infraestructura, pero no necesariamente los detalles internos de
Next.js.

El frontend debe comportarse como una SPA/frontend tradicional:

- Las operaciones principales llaman directo a una API externa.
- No se deben reintroducir Server Actions para operaciones de negocio.
- No se debe usar Next como proxy del backend.
- El objetivo de despliegue es hosting estatico sin compute, idealmente S3 +
  CloudFront, aunque tambien puede probarse en Vercel o Amplify.

## Backend Y Entorno

El backend se documenta en `api-docs-json.json`.

`NEXT_PUBLIC_API_URL` incluye el prefijo completo `/api/v1`. Por ejemplo:

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

Por eso las llamadas deben usar endpoints relativos como:

```ts
apiRequest('/auth/register')
apiRequest('/customers')
apiRequest('/quotes')
```

No agregar de nuevo `/api/v1` en codigo.

Variables canonicas:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AWS_COGNITO_REGION=
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=
ASSETS_HOSTNAME=
```

No usar `NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID`; el nombre valido es
`NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID`.

`ASSETS_HOSTNAME` debe ser solo el hostname, sin protocolo. Ejemplos:

```env
ASSETS_HOSTNAME=d123abcxyz.cloudfront.net
ASSETS_HOSTNAME=assets.example.com
```

## Autenticacion

La autenticacion usa Cognito directo desde el cliente.

Detalles importantes:

- El login usa Cognito `USER_PASSWORD_AUTH`.
- El refresh usa Cognito `REFRESH_TOKEN_AUTH`.
- El backend espera el `IdToken` en `Authorization: Bearer <idToken>`.
- Cognito no entrega el token por header; el frontend guarda tokens recibidos
  desde la respuesta.
- El registro de tenant/usuario principal es la excepcion: debe pasar por
  `/auth/register`, porque el backend crea tenant, usuario local y recursos
  asociados.
- El resto de operaciones de auth se hacen directo contra Cognito cuando aplica.

Sesion cliente:

- Ver `modules/auth/lib/session-client.ts`.
- El refresh token se usa para obtener un nuevo id token cuando expira.
- `apiRequest` reintenta una vez ante `401` despues de refrescar sesion.
- `403` no debe refrescar sesion; representa falta real de permisos.

## Cliente API

El cliente HTTP central esta en:

```txt
lib/api/client.ts
```

Reglas:

- No usar `fetchWithAuth`; fue eliminado.
- No crear wrappers server-side.
- No leer cookies desde servidor.
- No manejar todos los `404` globalmente como vacios.
- El manejo especifico de errores debe vivir en el cliente de cada modulo.

Ejemplo importante:

- En listados de cotizaciones y ordenes, el backend puede devolver `404` cuando
  no hay datos. Para esos listados se interpreta como `[]`.
- En detalles (`/quotes/{id}`, `/orders/{id}`), `404` debe seguir siendo error
  real de "no encontrado".

## Modulos Migrados

Los modulos principales ya fueron migrados a llamadas cliente:

- Auth
- Empleados
- Clientes
- Prendas
- Cotizaciones
- Ordenes
- Dashboard/layout/perfil

Ecommerce fue eliminado porque el backend lo depreco.

No deben volver a crearse:

- `modules/**/actions`
- `modules/**/queries.ts`
- `lib/fetch.ts`
- `modules/auth/lib/dal.ts`
- `cookies()` / `headers()` / `server-only` para flujos principales

## Rutas Y Export Estatico

El proyecto esta configurado para export estatico:

```ts
// next.config.ts
output: 'export'
```

Tambien se usa:

```ts
images: {
  unoptimized: true
}
```

Esto evita depender del servidor de optimizacion de imagenes de Next. Las
imagenes remotas se sirven directamente desde S3/CloudFront u otro CDN.

Las rutas con IDs no usan segmentos dinamicos `[id]`, porque eso impide un
export estatico simple con IDs desconocidos en build time.

Patron actual:

```txt
/admin/clothes/detail?id=...
/admin/clothes/edit?id=...
/admin/quotations/detail?id=...
/admin/quotations/edit?id=...
/admin/orders/detail?id=...
```

Tambien existen equivalentes para `/seller`.

Para construir links usar:

```ts
import { detailPath, editPath } from '@/lib/routes'
```

No volver a rutas tipo:

```txt
/admin/clothes/{id}
/admin/clothes/{id}/edit
```

## Despliegue

Para hosting estatico:

```bash
pnpm run build
```

El artefacto correcto es:

```txt
out/
```

Para S3 + CloudFront, subir el contenido de `out/`, no `.next/`.

Para probar localmente:

```bash
pnpx serve@latest out
```

En Vercel:

- Mantener Framework Preset: `Next.js`.
- No poner `out` como Output Directory cuando se usa preset Next.js.
- Agregar env vars `NEXT_PUBLIC_*` y `ASSETS_HOSTNAME`.

## Validaciones

Comandos utiles:

```bash
pnpm exec tsc --noEmit
pnpm run build
```

Lint enfocado:

```bash
pnpm exec eslint <archivos-tocados>
```

El lint global puede reportar un error preexistente en
`components/ui/sidebar.tsx` por `Math.random()` durante render. No pertenece a
la migracion de Server Actions.

## Roadmap

El historial de fases de migracion esta en:

```txt
docs/server-actions-migration-roadmap.md
```

Consultar ese archivo antes de hacer cambios grandes.
