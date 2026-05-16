package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getSubjectService() *service.SubjectService {
	repo := repository.NewSubjectRepository(database.DB)
	return service.NewSubjectService(repo)
}

func GetSubjects(c *fiber.Ctx) error {
	subjectService := getSubjectService()

	items, err := subjectService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลรายวิชาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func GetSubjectByID(c *fiber.Ctx) error {
	subjectService := getSubjectService()
	id := c.Params("id")

	item, err := subjectService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    item,
	})
}

func CreateSubject(c *fiber.Ctx) error {
	subjectService := getSubjectService()

	var input service.CreateSubjectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := subjectService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลรายวิชาสำเร็จ",
		"data":    item,
	})
}

func UpdateSubject(c *fiber.Ctx) error {
	subjectService := getSubjectService()
	id := c.Params("id")

	var input service.UpdateSubjectInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := subjectService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลรายวิชาสำเร็จ",
		"data":    item,
	})
}

func UpdateSubjectStatus(c *fiber.Ctx) error {
	subjectService := getSubjectService()
	id := c.Params("id")

	var input service.UpdateSubjectStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := subjectService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะรายวิชาสำเร็จ",
		"data":    item,
	})
}

func DeleteSubject(c *fiber.Ctx) error {
	subjectService := getSubjectService()
	id := c.Params("id")

	if err := subjectService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลรายวิชาสำเร็จ",
	})
}