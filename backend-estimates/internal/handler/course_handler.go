package handler

import (
	"backend-estimates/internal/repository"
	"backend-estimates/internal/service"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
)

func getCourseService() *service.CourseService {
	repo := repository.NewCourseRepository(database.DB)
	degreeLevelRepo := repository.NewDegreeLevelRepository(database.DB)
	return service.NewCourseService(repo, degreeLevelRepo)
}

func GetCourses(c *fiber.Ctx) error {
	courseService := getCourseService()

	items, err := courseService.GetAll()
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

func GetCoursesGrouped(c *fiber.Ctx) error {
	courseService := getCourseService()

	items, err := courseService.GetGroupedByDegreeLevel()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "ดึงข้อมูลหลักสูตรแบบจัดกลุ่มไม่สำเร็จ",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    items,
	})
}

func GetCourseByID(c *fiber.Ctx) error {
	courseService := getCourseService()
	id := c.Params("id")

	item, err := courseService.GetByID(id)
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

func CreateCourse(c *fiber.Ctx) error {
	courseService := getCourseService()

	var input service.CreateCourseInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := courseService.Create(input)
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

func UpdateCourse(c *fiber.Ctx) error {
	courseService := getCourseService()
	id := c.Params("id")

	var input service.UpdateCourseInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := courseService.Update(id, input)
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

func UpdateCourseStatus(c *fiber.Ctx) error {
	courseService := getCourseService()
	id := c.Params("id")

	var input service.UpdateCourseStatusInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
	}

	item, err := courseService.UpdateStatus(id, input)
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

func DeleteCourse(c *fiber.Ctx) error {
	courseService := getCourseService()
	id := c.Params("id")

	if err := courseService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "ลบข้อมูลหลักสูตรสำเร็จ",
	})
}