package database

import (
	"log"
	
	// เปลี่ยน "your_project_name" เป็นชื่อ module ในไฟล์ go.mod ของคุณ
	"backend-estimates/internal/models" 
)

func MigrateAndSeed() {
	// 1. Auto Migrate (สร้างหรืออัปเดตตารางให้ตรงกับ Model)
	err := DB.AutoMigrate(
		&models.Role{},
		&models.User{},
	)
	if err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}
	log.Println("✅ Database Migrated Successfully")

	// 2. Seeding (ตั้งค่าเริ่มต้นให้ตาราง Role)
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