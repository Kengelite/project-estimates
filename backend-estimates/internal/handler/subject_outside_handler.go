package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getSubjectOutsideService() *service.SubjectOutsideService {
	repo := repository.NewSubjectOutsideRepository(database.DB)
	return service.NewSubjectOutsideService(repo)
}

func GetSubjectOutsides(c *fiber.Ctx) error {
	subjectOutsideService := getSubjectOutsideService()

	items, err := subjectOutsideService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลวิชานอกคณะไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateSubjectOutside(c *fiber.Ctx) error {
	subjectOutsideService := getSubjectOutsideService()

	var input service.CreateSubjectOutsideInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := subjectOutsideService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลวิชานอกคณะสำเร็จ",
		"data":    item,
	})
}

func UpdateSubjectOutside(c *fiber.Ctx) error {
	subjectOutsideService := getSubjectOutsideService()
	id := c.Params("id")

	var input service.UpdateSubjectOutsideInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := subjectOutsideService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลวิชานอกคณะสำเร็จ",
		"data":    item,
	})
}

func UpdateSubjectOutsideStatus(c *fiber.Ctx) error {
	subjectOutsideService := getSubjectOutsideService()
	id := c.Params("id")

	var input service.UpdateSubjectOutsideStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := subjectOutsideService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะวิชานอกคณะสำเร็จ",
		"data":    item,
	})
}

func DeleteSubjectOutside(c *fiber.Ctx) error {
	subjectOutsideService := getSubjectOutsideService()
	id := c.Params("id")

	if err := subjectOutsideService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลวิชานอกคณะสำเร็จ",
	})
}