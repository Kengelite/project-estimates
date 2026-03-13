# ---------- Stage 1: Build the Go binary ----------
FROM golang:1.22-alpine AS builder

WORKDIR /app

# คัดลอกไฟล์ go.mod และ go.sum เพื่อลง dependencies
COPY go.mod go.sum ./
RUN go mod download

# คัดลอกโค้ดทั้งหมด
COPY . .

# Build เป็นไฟล์ binary ชื่อ "main"
# CGO_ENABLED=0 เพื่อให้รันบน alpine ได้อย่างอิสระ
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# ---------- Stage 2: Production runtime ----------
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# คัดลอกไฟล์ binary จาก stage แรก
COPY --from=builder /app/main .

# (ถ้ามี) คัดลอกไฟล์ .env หรือโฟลเดอร์อื่นๆ เช่น static/views
# COPY --from=builder /app/.env .

EXPOSE 3001

CMD ["./main"]