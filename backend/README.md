# NextGenX Hub Backend

Express.js backend for FCM Push Notifications.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Firebase Admin

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (nextgenx-7a8a8)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in the backend folder

### 3. Create .env File
```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

Or use environment variables directly:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=nextgenx-7a8a8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nextgenx-7a8a8.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Device Registration
```
POST /api/devices/register
Body: { token, userId?, deviceInfo? }

POST /api/devices/unregister
Body: { token }

GET /api/devices/
GET /api/devices/count
```

### Push Notifications
```
POST /api/notifications/send
Body: { token, title, body, data? }

POST /api/notifications/send-multiple
Body: { tokens[], title, body, data? }

POST /api/notifications/send-all
Body: { title, body, data? }

POST /api/notifications/send-user
Body: { userId, title, body, data? }

POST /api/notifications/send-topic
Body: { topic, title, body, data? }

POST /api/notifications/subscribe
Body: { token, topic }

POST /api/notifications/unsubscribe
Body: { token, topic }
```

## Example Usage

### Send notification to all users
```bash
curl -X POST http://localhost:3000/api/notifications/send-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Update!",
    "body": "Check out the latest tools in NextGenX Hub",
    "data": { "screen": "Tools" }
  }'
```

### Register a device
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[xxxxx]",
    "userId": "user123",
    "deviceInfo": {
      "platform": "android",
      "deviceName": "Pixel 7"
    }
  }'
```

## Firestore Collections

The backend uses these Firestore collections:

- `device_tokens` - Stores registered device tokens
  - `token`: string
  - `userId`: string | null
  - `platform`: string
  - `deviceName`: string
  - `appVersion`: string
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `isActive`: boolean

## Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/index.js --name nextgenx-backend
pm2 save
```

### Using Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

## Security Notes

- Never commit `serviceAccountKey.json` or `.env` to version control
- Use HTTPS in production
- Add authentication middleware for admin endpoints
- Consider rate limiting for notification endpoints
