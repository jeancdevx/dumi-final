# Telar Frontend 
Frontend de Telar, construido con Next.js (App Router), Shadcn UI, Tailwind CSS, TypeScript y autenticación directa con AWS Cognito.

## Requisitos

- **Node.js**: >= 20 (Recomendado Node.js 22)
- **pnpm**: Administrador de paquetes recomendado

## Levantamiento En Local

1. Instala las dependencias:
   ```bash
   pnpm install
   ```

2. Crea el archivo de entorno local:
   ```bash
   cp .env.example .env.local
   ```

3. Configura `.env.local` con tus valores locales o los valores entregados por la infraestructura.

4. Inicia la aplicación en modo desarrollo:
   ```bash
   pnpm dev
   ```

   La aplicación frontend quedará disponible en:
   [http://localhost:3002](http://localhost:3002)

## Variables de Entorno

El frontend requiere las siguientes variables de entorno para funcionar:

- `NEXT_PUBLIC_API_URL`: URL base de la API, incluyendo el prefijo de versión (ej. `https://api.example.com/api/v1`).
- `NEXT_PUBLIC_AWS_COGNITO_REGION`: Región del pool de usuarios de AWS Cognito (ej. `us-east-1`).
- `NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID`: ID del cliente de la aplicación en Cognito.
- `ASSETS_HOSTNAME`: Solo el hostname del servidor/CDN de recursos de imágenes (ej. `assets.example.com` o `d123abcxyz.cloudfront.net`), sin protocolo.

## Tests

Los tests de componentes y lógica unitaria se ejecutan usando Jest y React Testing Library:

- Ejecutar tests:
  ```bash
  pnpm test
  ```

- Ejecutar tests en modo de observación (watch mode):
  ```bash
  pnpm test:watch
  ```

## Rutas y Export Estático

Este frontend está configurado para generar un artefacto de **exportación estática** (`output: 'export'` en `next.config.ts`), lo que permite que sea desplegado sin necesidad de un servidor Node.js en ejecución.

## Validaciones y Formato

Antes de realizar confirmaciones de código, asegúrate de correr las validaciones locales:

- Chequeo de tipos estáticos (TypeScript):
  ```bash
  pnpm exec tsc --noEmit
  ```

- Analizar el código (ESLint):
  ```bash
  pnpm run lint
  ```

- Corregir errores automáticos de linting:
  ```bash
  pnpm run lint:fix
  ```

- Formatear el código con Prettier:
  ```bash
  pnpm run format
  ```

## Despliegue

### Hosting Estático (AWS S3 + CloudFront)
1. Genera el build de producción:
   ```bash
   pnpm run build
   ```
2. Sube el contenido del directorio **`out/`** (no de `.next/`) al bucket S3 y limpia el caché del CDN de CloudFront.

### Probar el Build Estático en Local
Para verificar que el export estático funciona correctamente antes de subirlo:
```bash
pnpx serve@latest out
```

