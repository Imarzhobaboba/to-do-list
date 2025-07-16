FROM golang:1.23.11-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /backend main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /backend .
# COPY --from=builder /app/configs ./configs

RUN apk --no-cache add ca-certificates

EXPOSE 8080

CMD ["./backend"]
