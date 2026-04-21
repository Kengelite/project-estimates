package main

import (
	"github.com/joho/godotenv"
	"log"
	"os"

	"backend-estimates/internal/handler"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" 
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	err := godotenv.Load()
    if err != nil {
        log.Println("Warning: .env file not found")
    }
	database.Connect()
	database.MigrateAndSeed()

	app := fiber.New()

	app.Use(logger.New(logger.Config{
		// ปรับรูปแบบ Log ตามใจชอบ (เวลา | สถานะ | วิธีการ | เส้นทาง)
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	
	// 👇 2. เพิ่มส่วนนี้เพื่อเปิดรับ Request จากหน้าบ้าน (React)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // ในโหมด Dev อนุญาตทุกโดเมนไปก่อน (ขึ้น Production ค่อยแก้เป็น URL จริง)
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH",
	}))

	app.Use(logger.New()) 

	api := app.Group("/api")
	auth := api.Group("/auth")
	
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status": "ok",
			"message": "API is running",
		})
	})
	
	log.Fatal(app.Listen(":" + port))
}