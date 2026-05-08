package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getSubjectCategoryService() *service.SubjectCategoryService {
	repo := repository.NewSubjectCategoryRepository(database.DB)
	return service.NewSubjectCategoryService(repo)
}

func GetSubjectCategories(c *fiber.Ctx) error {
	subjectCategoryService := getSubjectCategoryService()

	items, err := subjectCategoryService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลหมวดวิชาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateSubjectCategory(c *fiber.Ctx) error {
	subjectCategoryService := getSubjectCategoryService()

	var input service.CreateSubjectCategoryInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := subjectCategoryService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มหมวดวิชาสำเร็จ",
		"data":    item,
	})
}

func UpdateSubjectCategory(c *fiber.Ctx) error {
	subjectCategoryService := getSubjectCategoryService()
	id := c.Params("id")

	var input service.UpdateSubjectCategoryInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := subjectCategoryService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขหมวดวิชาสำเร็จ",
		"data":    item,
	})
}

func UpdateSubjectCategoryStatus(c *fiber.Ctx) error {
	subjectCategoryService := getSubjectCategoryService()
	id := c.Params("id")

	var input service.UpdateSubjectCategoryStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := subjectCategoryService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะหมวดวิชาสำเร็จ",
		"data":    item,
	})
}

func DeleteSubjectCategory(c *fiber.Ctx) error {
	subjectCategoryService := getSubjectCategoryService()
	id := c.Params("id")

	if err := subjectCategoryService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบหมวดวิชาสำเร็จ",
	})
}