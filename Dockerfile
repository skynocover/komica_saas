FROM node:16.13.1-slim AS build
RUN apt-get -qy update && apt-get -qy install openssl
# RUN apt add openssl
# RUN apt-get -gy install git
# RUN apk add git
RUN apt-get update && apt-get install -y --no-install-recommends git && apt-get purge -y --auto-remove
COPY . .
RUN yarn install
RUN yarn global add typescript
RUN yarn build

# --------------> The production image
FROM node:16.13.1-slim AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

USER nextjs

CMD ["yarn", "start"]
