package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func getSectionService() *service.SectionService {
	repo := repository.NewSectionRepository(database.DB)
	return service.NewSectionService(repo)
}

func GetSections(c *fiber.Ctx) error {
	sectionService := getSectionService()

	items, err := sectionService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลโครงการระดับปริญญาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateSection(c *fiber.Ctx) error {
	sectionService := getSectionService()

	var input service.CreateSectionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := sectionService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มโครงการระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func UpdateSection(c *fiber.Ctx) error {
	sectionService := getSectionService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateSectionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := sectionService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขโครงการระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func UpdateSectionStatus(c *fiber.Ctx) error {
	sectionService := getSectionService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateSectionStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := sectionService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะโครงการระดับปริญญาสำเร็จ",
		"data":    item,
	})
}

func DeleteSection(c *fiber.Ctx) error {
	sectionService := getSectionService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	if err := sectionService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบโครงการระดับปริญญาสำเร็จ",
	})
}