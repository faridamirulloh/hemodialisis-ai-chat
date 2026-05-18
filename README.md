# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t hemodialisis-app .
docker save -o hemodialisis-app.tar hemodialisis-app:latest
scp hemodialisis-app.tar docker-compose.yml ari@ari:/home/ari/app/
ssh ari@ari "cd /home/ari/app && docker load -i hemodialisis-app.tar && docker compose down && docker compose up -d"

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Prisma & PostgreSQL

This project uses [Prisma](https://www.prisma.io/) as the ORM and connects to a PostgreSQL database.

### Managing Prisma

1. **Set up your database connection:**

   Make sure your PostgreSQL database is online and accessible.

   Create a `.env` file in the project root and add your PostgreSQL connection string:

   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

2. **Introspect or create your schema:**
   - Edit `prisma/schema.prisma` to define your models.
   - Or, introspect an existing database:

     ```bash
     pnpm prisma db pull
     ```

3. **Run migrations:**

   ```bash
   pnpm run prisma:migrate
   ```

4. **Generate Prisma Client:**

   ```bash
   pnpm run prisma:generate
   ```

5. **Access Prisma Client in your code:**

   It’s recommended to manage your database logic in the `~/db` directory. Import the Prisma Client where needed, for example:

   ```ts
   import { prisma } from '~/lib/prisma.server';
   ```

### Useful Prisma Commands

- `pnpm prisma studio` — Open Prisma Studio to view and edit data
- `pnpm prisma migrate dev` — Run migrations in development
- `pnpm prisma db push` — Push schema changes to the database (no migrations)
- `pnpm prisma generate` — Regenerate Prisma Client

See the [Prisma docs](https://www.prisma.io/docs/) for more details.
