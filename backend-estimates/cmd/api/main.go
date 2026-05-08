package main

import (
	"github.com/joho/godotenv"
	"log"
	"os"

	"backend-estimates/internal/handler"
	"backend-estimates/pkg/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}
	database.Connect()
	database.MigrateAndSeed()

	app := fiber.New()

	app.Use(logger.New(logger.Config{
		// ปรับรูปแบบ Log ตามใจชอบ (เวลา | สถานะ | วิธีการ | เส้นทาง)
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	// 👇 2. เพิ่มส่วนนี้เพื่อเปิดรับ Request จากหน้าบ้าน (React)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // ในโหมด Dev อนุญาตทุกโดเมนไปก่อน (ขึ้น Production ค่อยแก้เป็น URL จริง)
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH",
	}))

	app.Use(logger.New())

	api := app.Group("/api")
	auth := api.Group("/auth")
	years := api.Group("/years")
	degreeLevels := api.Group("/degree-levels")
	sections := api.Group("/sections")
	semesters := api.Group("/semesters")
	studentYears := api.Group("/student-years")
	subjectCategories := api.Group("/subject-categories")
	subjectOutsides := api.Group("/subject-outsides")
	funds := api.Group("/funds")
	centrals := api.Group("/centrals")
	universityWorks := api.Group("/university-works")
	curriculums := api.Group("/curriculums")
	courses := api.Group("/courses")

	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	years.Get("/", handler.GetYears)
	years.Post("/", handler.CreateYear)
	years.Put("/:id", handler.UpdateYear)
	years.Patch("/:id/status", handler.UpdateYearStatus)
	years.Delete("/:id", handler.DeleteYear)

	degreeLevels.Get("/", handler.GetDegreeLevels)
	degreeLevels.Post("/", handler.CreateDegreeLevel)
	degreeLevels.Put("/:id", handler.UpdateDegreeLevel)
	degreeLevels.Patch("/:id/status", handler.UpdateDegreeLevelStatus)
	degreeLevels.Delete("/:id", handler.DeleteDegreeLevel)

	semesters.Get("/", handler.GetSemesters)
	semesters.Post("/", handler.CreateSemester)
	semesters.Put("/:id", handler.UpdateSemester)
	semesters.Patch("/:id/status", handler.UpdateSemesterStatus)
	semesters.Delete("/:id", handler.DeleteSemester)

	sections.Get("/", handler.GetSections)
	sections.Post("/", handler.CreateSection)
	sections.Put("/:id", handler.UpdateSection)
	sections.Patch("/:id/status", handler.UpdateSectionStatus)
	sections.Delete("/:id", handler.DeleteSection)

	studentYears.Get("/", handler.GetStudentYears)
	studentYears.Post("/", handler.CreateStudentYear)
	studentYears.Put("/:id", handler.UpdateStudentYear)
	studentYears.Patch("/:id/status", handler.UpdateStudentYearStatus)
	studentYears.Delete("/:id", handler.DeleteStudentYear)

	subjectCategories.Get("/", handler.GetSubjectCategories)
	subjectCategories.Post("/", handler.CreateSubjectCategory)
	subjectCategories.Put("/:id", handler.UpdateSubjectCategory)
	subjectCategories.Patch("/:id/status", handler.UpdateSubjectCategoryStatus)
	subjectCategories.Delete("/:id", handler.DeleteSubjectCategory)

	subjectOutsides.Get("/", handler.GetSubjectOutsides)
	subjectOutsides.Post("/", handler.CreateSubjectOutside)
	subjectOutsides.Put("/:id", handler.UpdateSubjectOutside)
	subjectOutsides.Patch("/:id/status", handler.UpdateSubjectOutsideStatus)
	subjectOutsides.Delete("/:id", handler.DeleteSubjectOutside)

	funds.Get("/", handler.GetFunds)
	funds.Post("/", handler.CreateFund)
	funds.Put("/:id", handler.UpdateFund)
	funds.Patch("/:id/status", handler.UpdateFundStatus)
	funds.Delete("/:id", handler.DeleteFund)

	centrals.Get("/", handler.GetCentrals)
	centrals.Post("/", handler.CreateCentral)
	centrals.Put("/:id", handler.UpdateCentral)
	centrals.Patch("/:id/status", handler.UpdateCentralStatus)
	centrals.Delete("/:id", handler.DeleteCentral)

	universityWorks.Get("/", handler.GetUniversityWorks)
	universityWorks.Post("/", handler.CreateUniversityWork)
	universityWorks.Put("/:id", handler.UpdateUniversityWork)
	universityWorks.Patch("/:id/status", handler.UpdateUniversityWorkStatus)
	universityWorks.Delete("/:id", handler.DeleteUniversityWork)

	curriculums.Get("/", handler.GetCurriculums)
	curriculums.Post("/", handler.CreateCurriculum)
	curriculums.Put("/:id", handler.UpdateCurriculum)
	curriculums.Patch("/:id/status", handler.UpdateCurriculumStatus)
	curriculums.Delete("/:id", handler.DeleteCurriculum)

	courses.Get("/", handler.GetCourses)
	courses.Get("/grouped", handler.GetCoursesGrouped)
	courses.Get("/:id", handler.GetCourseByID)
	courses.Post("/", handler.CreateCourse)
	courses.Put("/:id", handler.UpdateCourse)
	courses.Patch("/:id/status", handler.UpdateCourseStatus)
	courses.Delete("/:id", handler.DeleteCourse)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "ok",
			"message": "API is running",
		})
	})

	log.Fatal(app.Listen(":" + port))
}
