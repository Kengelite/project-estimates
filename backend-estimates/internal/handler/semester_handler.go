package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func getSemesterService() *service.SemesterService {
	repo := repository.NewSemesterRepository(database.DB)
	return service.NewSemesterService(repo)
}

func GetSemesters(c *fiber.Ctx) error {
	semesterService := getSemesterService()

	items, err := semesterService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลภาคการศึกษาไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func CreateSemester(c *fiber.Ctx) error {
	semesterService := getSemesterService()

	var input service.CreateSemesterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := semesterService.Create(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "เพิ่มภาคการศึกษาสำเร็จ",
		"data":    item,
	})
}

func UpdateSemester(c *fiber.Ctx) error {
	semesterService := getSemesterService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateSemesterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := semesterService.Update(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "แก้ไขภาคการศึกษาสำเร็จ",
		"data":    item,
	})
}

func UpdateSemesterStatus(c *fiber.Ctx) error {
	semesterService := getSemesterService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	var input service.UpdateSemesterStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, updateErr := semesterService.UpdateStatus(id, input)
	if updateErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": updateErr.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "อัปเดตสถานะภาคการศึกษาสำเร็จ",
		"data":    item,
	})
}

func DeleteSemester(c *fiber.Ctx) error {
	semesterService := getSemesterService()

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "id ไม่ถูกต้อง",
		})
	}

	if err := semesterService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบภาคการศึกษาสำเร็จ",
	})
}