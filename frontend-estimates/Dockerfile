# ---------- Stage 1: Build the React application ----------
FROM node:20-alpine AS builder

# รับค่า ARG เพื่อฝัง API URL ลงในโค้ด React ตอน Build
ARG VITE_API_URL=http://10.198.110.26:3001

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# ตั้งค่า ENV ให้ Vite มองเห็นตอน Build (สำคัญมากสำหรับ React)
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------- Stage 2: Production runtime with Nginx ----------
FROM nginx:stable-alpine

# คัดลอกไฟล์ที่ build เสร็จแล้ว (ปกติ Vite จะอยู่ที่โฟลเดอร์ dist)
# ถ้าคุณใช้ Create React App (CRA) ให้เปลี่ยนจาก dist เป็น build
COPY --from=builder /app/dist /usr/share/nginx/html

# คัดลอกไฟล์คอนฟิก Nginx (ถ้ามี เพื่อจัดการเรื่อง Client-side Routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]