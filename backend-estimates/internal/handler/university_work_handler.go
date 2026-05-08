package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getUniversityWorkService() *service.UniversityWorkService {
	repo := repository.NewUniversityWorkRepository(database.DB)
	return service.NewUniversityWorkService(repo)
}

func GetUniversityWorks(c *fiber.Ctx) error {
	universityWorkService := getUniversityWorkService()

	items, err := universityWorkService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลงานมหาวิทยาลัยไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateUniversityWork(c *fiber.Ctx) error {
	universityWorkService := getUniversityWorkService()

	var input service.CreateUniversityWorkInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := universityWorkService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มข้อมูลงานมหาวิทยาลัยสำเร็จ",
		"data":    item,
	})
}

func UpdateUniversityWork(c *fiber.Ctx) error {
	universityWorkService := getUniversityWorkService()
	id := c.Params("id")

	var input service.UpdateUniversityWorkInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := universityWorkService.Update(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขข้อมูลงานมหาวิทยาลัยสำเร็จ",
		"data":    item,
	})
}

func UpdateUniversityWorkStatus(c *fiber.Ctx) error {
	universityWorkService := getUniversityWorkService()
	id := c.Params("id")

	var input service.UpdateUniversityWorkStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := universityWorkService.UpdateStatus(id, input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะงานมหาวิทยาลัยสำเร็จ",
		"data":    item,
	})
}

func DeleteUniversityWork(c *fiber.Ctx) error {
	universityWorkService := getUniversityWorkService()
	id := c.Params("id")

	if err := universityWorkService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลงานมหาวิทยาลัยสำเร็จ",
	})
}