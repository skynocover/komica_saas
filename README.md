# Akraft [link](https://www.akraft.net/)

> The easiest way to build an imageboard using SaaS

![Akraft](./assets/Akraft.png)

![Thrad](./assets//Thread.png)

[Try Demo Here](https://www.akraft.net/Login)

## Technical

### Frontend

- [Next.js](https://nextjs.org/) (with typescript)
- [tailwind](https://tailwindcss.com/)
- [material-ui](https://mui.com/zh/) (Front desk for website)
- [antd](https://ant.design/) (Dashboard for website)
- [i18next](https://www.i18next.com/) (localization)

### Backend

- orm: [Prisma](https://www.prisma.io/)
- Auth: [Firebase](https://firebase.google.com/)
- CICD: [caprover](https://caprover.com/)
- [i18next generator](https://github.com/skynocover/i18n_airtable)


### Hardward

- Server: [Oracle VPS](https://www.oracle.com/) (4core / 24G ram)
- DB: [mongodb](https://www.mongodb.com/atlas/database)
- image storage: [Cloudflare Images](https://www.cloudflare.com/products/cloudflare-images/)


## enviroment setting

```c
DATABASE_URL= mongodb URL

// Your Domain, use for redirection
NEXT_PUBLIC_DOMAIN="http://localhost:3000"

// Frontend configuration for Firebase
NEXT_PUBLIC_FIREBASE_API_KEY = ""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = ""
NEXT_PUBLIC_FIREBASE_PROJECT_ID = ""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = ""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = ""
NEXT_PUBLIC_FIREBASE_APP_ID = ""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = ""

// Backend configuration for Firebase
FIREBASE_PROJECT_ID=""
FIREBASE_PROJECT_KEY="-----BEGIN PRIVATE KEY-----\~~~~~~~\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=""

// cookie setting
COOKIE_NAME=""
JWT_SECRET=""

// Cloud flare Image setting
CF_IMAGE_ACCOUNT_ID=""
CF_IMAGE_TOKEN=""
NEXT_PUBLIC_CF_IMAGE_URL=""


// This is airtable setting, you don't need to use this in production
I18N_AIRTABLE_API_KEY=""
I18N_AIRTABLE_WORKSPACE=""
I18N_AIRTABLE_TABLE=i18n
```