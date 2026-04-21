package handler

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"fmt"
	"github.com/gofiber/fiber/v2"
)

func Register(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// ดึง Role 'user' เป็นค่าเริ่มต้นให้คนที่สมัครใหม่
	var defaultRole models.Role
	database.DB.Where("name = ?", "user").First(&defaultRole)
	user.RoleID = defaultRole.ID

	if err := service.RegisterUser(&user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not register user"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
    // 1. ปรับ Struct ให้รองรับ json:"pwd" จากหน้าบ้าน แต่ใช้ชื่อ Password ใน Go
    var input struct {
        Email    string `json:"email"`
        Password string `json:"pwd"` // รับจาก JSON ชื่อ pwd มาใส่ในตัวแปร Password
    }

    // 2. Parse ข้อมูล
    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
    }

	
    // 3. พิมพ์ Log ดูค่า (คราวนี้ Password จะไม่ว่างแล้ว)
    fmt.Printf("Login Request: Email=%s, Password=%s\n", input.Email, input.Password)

    // 4. ส่งไปที่ Service
    token, err := service.LoginUser(input.Email, input.Password)
    if err != nil {
        // ถ้าขึ้น 401 ตรงนี้ แปลว่า bcrypt เทียบรหัสไม่ผ่านจริงๆ
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"token": token})
}