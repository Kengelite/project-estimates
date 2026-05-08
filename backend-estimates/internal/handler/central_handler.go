package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getCentralService() *service.CentralService {
	repo := repository.NewCentralRepository(database.DB)
	return service.NewCentralService(repo)
}

func GetCentrals(c *fiber.Ctx) error {
	centralService := getCentralService()

	items, err := centralService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลส่วนกลางไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateCentral(c *fiber.Ctx) error {
	centralService := getCentralService()

	var input service.CreateCentralInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := centralService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลส่วนกลางสำเร็จ",
		"data":    item,
	})
}

func UpdateCentral(c *fiber.Ctx) error {
	centralService := getCentralService()
	id := c.Params("id")

	var input service.UpdateCentralInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := centralService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลส่วนกลางสำเร็จ",
		"data":    item,
	})
}

func UpdateCentralStatus(c *fiber.Ctx) error {
	centralService := getCentralService()
	id := c.Params("id")

	var input service.UpdateCentralStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := centralService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะส่วนกลางสำเร็จ",
		"data":    item,
	})
}

func DeleteCentral(c *fiber.Ctx) error {
	centralService := getCentralService()
	id := c.Params("id")

	if err := centralService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลส่วนกลางสำเร็จ",
	})
}