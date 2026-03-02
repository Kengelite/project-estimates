// package backendestimates
package main

import (
    "log"

    "github.com/gofiber/fiber/v3"
)

func main() {
    // สร้างแอปพลิเคชัน Fiber
    app := fiber.New()

    // สร้าง Route พื้นฐานที่ Path "/"
    app.Get("/", func(c fiber.Ctx) error {
        return c.SendString("Hello, Go Fiber! 🚀")
    })

    // สั่งให้ Server ทำงานที่ Port 3000
    log.Fatal(app.Listen(":3000"))
}