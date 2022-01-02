FROM node:lts AS build
# RUN apk-get add --no-cache libc6-compat
RUN apt-get install git
RUN apt-get install openssl
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn global add typescript
RUN yarn build

ENV NODE_ENV production
CMD ["yarn", "start"]


# --------------> The production image
# FROM node:lts AS runner
# WORKDIR /app

# ENV NODE_ENV production

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

# COPY --from=build /app/public ./public
# COPY --from=build /app/.next ./.next
# COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/package.json ./package.json

# USER nextjs

# CMD ["yarn", "start"]