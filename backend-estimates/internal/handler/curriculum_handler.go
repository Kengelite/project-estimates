package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getCurriculumService() *service.CurriculumService {
	repo := repository.NewCurriculumRepository(database.DB)
	return service.NewCurriculumService(repo)
}

func GetCurriculums(c *fiber.Ctx) error {
	curriculumService := getCurriculumService()

	items, err := curriculumService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลหลักสูตรไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateCurriculum(c *fiber.Ctx) error {
	curriculumService := getCurriculumService()

	var input service.CreateCurriculumInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := curriculumService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลหลักสูตรสำเร็จ",
		"data":    item,
	})
}

func UpdateCurriculum(c *fiber.Ctx) error {
	curriculumService := getCurriculumService()
	id := c.Params("id")

	var input service.UpdateCurriculumInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := curriculumService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลหลักสูตรสำเร็จ",
		"data":    item,
	})
}

func UpdateCurriculumStatus(c *fiber.Ctx) error {
	curriculumService := getCurriculumService()
	id := c.Params("id")

	var input service.UpdateCurriculumStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := curriculumService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะหลักสูตรสำเร็จ",
		"data":    item,
	})
}

func DeleteCurriculum(c *fiber.Ctx) error {
	curriculumService := getCurriculumService()
	id := c.Params("id")

	if err := curriculumService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลหลักสูตรสำเร็จ",
	})
}