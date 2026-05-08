package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getDegreeLevelService() *service.DegreeLevelService {
	repo := repository.NewDegreeLevelRepository(database.DB)
	return service.NewDegreeLevelService(repo)
}

func GetDegreeLevels(c *fiber.Ctx) error {
	degreeLevelService := getDegreeLevelService()

	items, err := degreeLevelService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลระดับปริญญาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateDegreeLevel(c *fiber.Ctx) error {
	degreeLevelService := getDegreeLevelService()

	var input service.CreateDegreeLevelInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := degreeLevelService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func UpdateDegreeLevel(c *fiber.Ctx) error {
	degreeLevelService := getDegreeLevelService()
	id := c.Params("id")

	var input service.UpdateDegreeLevelInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := degreeLevelService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func UpdateDegreeLevelStatus(c *fiber.Ctx) error {
	degreeLevelService := getDegreeLevelService()
	id := c.Params("id")

	var input service.UpdateDegreeLevelStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := degreeLevelService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func DeleteDegreeLevel(c *fiber.Ctx) error {
	degreeLevelService := getDegreeLevelService()
	id := c.Params("id")

	if err := degreeLevelService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบระดับปริญญาสำเร็จ",
	})
}