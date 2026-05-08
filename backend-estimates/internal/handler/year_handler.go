package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func getYearService() *service.YearService {
	repo := repository.NewYearRepository(database.DB)
	return service.NewYearService(repo)
}

func GetYears(c *fiber.Ctx) error {
	yearService := getYearService()

	years, err := yearService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลปีการศึกษาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    years,
	})
}

func CreateYear(c *fiber.Ctx) error {
	yearService := getYearService()

	var input service.CreateYearInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	year, err := yearService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มปีการศึกษาสำเร็จ",
		"data":    year,
	})
}

func UpdateYear(c *fiber.Ctx) error {
	yearService := getYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateYearInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	year, updateErr := yearService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขปีการศึกษาสำเร็จ",
		"data":    year,
	})
}

func UpdateYearStatus(c *fiber.Ctx) error {
	yearService := getYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateYearStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	year, updateErr := yearService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะปีการศึกษาสำเร็จ",
		"data":    year,
	})
}

func DeleteYear(c *fiber.Ctx) error {
	yearService := getYearService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	if err := yearService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบปีการศึกษาสำเร็จ",
	})
}