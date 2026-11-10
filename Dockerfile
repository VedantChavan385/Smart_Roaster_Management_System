# Stage 1: Build Frontend Client
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY package.json ./
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --omit=dev

# Copy backend application source
COPY backend ./backend

# Copy compiled static frontend into position served by backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]

