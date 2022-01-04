FROM node:lts AS build
# RUN apk-get add --no-cache libc6-compat
RUN apt-get install git
RUN apt-get install openssl
WORKDIR /app
COPY . .
ARG FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
ARG FIREBASE_PROJECT_KEY=${FIREBASE_PROJECT_KEY}
ARG FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
ARG NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN}
ARG NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ARG NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
ARG NEXT_PUBLIC_CF_IMAGE_URL=${NEXT_PUBLIC_CF_IMAGE_URL}
ARG DATABASE_URL=${DATABASE_URL}
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