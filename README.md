# Setup process

This will assume you've made an account with Matterport and generated an API Token & Secret, as well as an SDK Key

Create a file called ".env" inside the root directory. Inside it add those values you've generated inside the .env file to these variables.
```
MATTERPORT_API_TOKEN=
MATTERPORT_API_SECRET=
MATTERPORT_SDK_KEY=
```

Install dependencies and run the project in development mode, default port is 5173.
```
npm install
```

```
npm run dev
```