# ---------- Stage 1: Build the React application ----------
FROM node:20-alpine AS builder

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- Stage 2: Production runtime with Nginx ----------
FROM nginx:stable-alpine

# คัดลอกโค้ดที่ Build แล้ว
COPY --from=builder /app/dist /usr/share/nginx/html

# เอาไฟล์ config ของเราไปทับของเดิม (บรรทัดนี้สำคัญมาก!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]