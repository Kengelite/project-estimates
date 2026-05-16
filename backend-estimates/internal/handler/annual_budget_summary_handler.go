package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getAnnualBudgetSummaryService() *service.AnnualBudgetSummaryService {
	repo := repository.NewAnnualBudgetSummaryRepository(database.DB)
	return service.NewAnnualBudgetSummaryService(repo)
}

func GetAnnualBudgetSummaries(c *fiber.Ctx) error {
	summaryService := getAnnualBudgetSummaryService()

	items, err := summaryService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลสรุปงบประมาณไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func GetAnnualBudgetSummaryByID(c *fiber.Ctx) error {
	summaryService := getAnnualBudgetSummaryService()
	id := c.Params("id")

	item, err := summaryService.GetByID(id)
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

func CreateAnnualBudgetSummary(c *fiber.Ctx) error {
	summaryService := getAnnualBudgetSummaryService()

	var input service.CreateAnnualBudgetSummaryInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := summaryService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "บันทึกสรุปงบประมาณสำเร็จ",
		"data":    item,
	})
}

func UpdateAnnualBudgetSummaryStatus(c *fiber.Ctx) error {
	summaryService := getAnnualBudgetSummaryService()
	id := c.Params("id")

	var input service.UpdateAnnualBudgetSummaryStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := summaryService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะสรุปงบประมาณสำเร็จ",
		"data":    item,
	})
}

func DeleteAnnualBudgetSummary(c *fiber.Ctx) error {
	summaryService := getAnnualBudgetSummaryService()
	id := c.Params("id")

	if err := summaryService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลสรุปงบประมาณสำเร็จ",
	})
}