package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getSplitGroupService() *service.SplitGroupService {
	repo := repository.NewSplitGroupRepository(database.DB)
	return service.NewSplitGroupService(repo)
}

func GetSplitGroups(c *fiber.Ctx) error {
	splitGroupService := getSplitGroupService()

	items, err := splitGroupService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลกลุ่มสัดส่วนไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func GetActiveSplitGroups(c *fiber.Ctx) error {
	splitGroupService := getSplitGroupService()

	items, err := splitGroupService.GetActive()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลกลุ่มสัดส่วนไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}