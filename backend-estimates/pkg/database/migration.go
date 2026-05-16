package database

import (
	"log"

	// เปลี่ยน "your_project_name" เป็นชื่อ module ในไฟล์ go.mod ของคุณ
	"backend-estimates/internal/models"
)

func MigrateAndSeed() {
	err := DB.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.Section{},
		&models.DegreeLevel{},
		&models.Central{},
		&models.CentralSplit{},
		&models.Curriculum{},
		&models.CurriculumSplit{},
		&models.UniversityWork{},
		&models.UniversityWorkSplit{},
		&models.Fund{},
		&models.Course{},
		&models.SubjectCourse{},
		&models.SubjectCategory{},
		&models.CourseStructure{},
		&models.SubjectOutside{},
		&models.SubjectOutsideDeduct{},
		&models.Semester{},
		&models.StudentYear{},
		&models.Year{},
		&models.Subject{},
		&models.CourseStudent{},
		&models.AnnualBudgetSummary{},
		&models.AnnualBudgetSummaryCourse{},
		&models.AnnualBudgetSummaryDetail{},
	)
	if err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}
	log.Println("✅ Database Migrated Successfully")

	seedRoles()
}

func seedRoles() {
	// กำหนด Role พื้นฐานที่ต้องการให้มีในระบบ
	roles := []string{"admin", "user"}

	for _, roleName := range roles {
		var role models.Role

		// ใช้ FirstOrCreate เพื่อป้องกันการ Insert ซ้ำเวลารันโปรแกรมใหม่
		// ถ้ามีชื่อ Role นี้อยู่แล้ว จะข้ามไป, ถ้ายังไม่มี จะสร้างใหม่
		err := DB.Where("name = ?", roleName).FirstOrCreate(&role, models.Role{Name: roleName}).Error
		if err != nil {
			log.Printf("❌ Failed to seed role '%s': %v", roleName, err)
		}
	}

	log.Println("✅ Default Roles Seeded Successfully")
}
