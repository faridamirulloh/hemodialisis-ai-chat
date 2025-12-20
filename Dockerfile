FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
WORKDIR /app

FROM base AS development-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM base AS build-env
COPY . .
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN pnpm prisma:generate
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# Copy generated prisma client from build stage
COPY --from=build-env /app/app/generated/prisma /app/app/generated/prisma
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/package.json ./
# Include Prisma client if needed (it's inside node_modules usually)
# If you use custom output for prisma, adjust accordingly.

EXPOSE 3000
CMD ["pnpm", "run", "start"]