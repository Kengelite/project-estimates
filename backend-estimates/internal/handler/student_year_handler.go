package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func getStudentYearService() *service.StudentYearService {
	repo := repository.NewStudentYearRepository(database.DB)
	return service.NewStudentYearService(repo)
}

func GetStudentYears(c *fiber.Ctx) error {
	studentYearService := getStudentYearService()

	items, err := studentYearService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลชั้นปีไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateStudentYear(c *fiber.Ctx) error {
	studentYearService := getStudentYearService()

	var input service.CreateStudentYearInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := studentYearService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มชั้นปีสำเร็จ",
		"data":    item,
	})
}

func UpdateStudentYear(c *fiber.Ctx) error {
	studentYearService := getStudentYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateStudentYearInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := studentYearService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "แก้ไขชั้นปีสำเร็จ",
			"data":    item,
	})
}

func UpdateStudentYearStatus(c *fiber.Ctx) error {
	studentYearService := getStudentYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateStudentYearStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := studentYearService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะชั้นปีสำเร็จ",
		"data":    item,
	})
}

func DeleteStudentYear(c *fiber.Ctx) error {
	studentYearService := getStudentYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	if err := studentYearService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบชั้นปีสำเร็จ",
	})
}