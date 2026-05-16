package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getUserService() *service.UserService {
	repo := repository.NewUserRepository(database.DB)
	return service.NewUserService(repo)
}

func GetUsers(c *fiber.Ctx) error {
	userService := getUserService()

	items, err := userService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลผู้ใช้งานไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func GetUserByID(c *fiber.Ctx) error {
	userService := getUserService()
	id := c.Params("id")

	item, err := userService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    item,
	})
}

func CreateUser(c *fiber.Ctx) error {
	userService := getUserService()

	var input service.CreateUserInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := userService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลผู้ใช้งานสำเร็จ",
		"data":    item,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	userService := getUserService()
	id := c.Params("id")

	var input service.UpdateUserInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := userService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลผู้ใช้งานสำเร็จ",
		"data":    item,
	})
}

func DeleteUser(c *fiber.Ctx) error {
	userService := getUserService()
	id := c.Params("id")

	if err := userService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลผู้ใช้งานสำเร็จ",
	})
}

func GetRoles(c *fiber.Ctx) error {
	userService := getUserService()

	items, err := userService.GetRoles()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลบทบาทไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}