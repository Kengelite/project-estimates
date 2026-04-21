package database

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB เป็นตัวแปร Global ที่ให้ไฟล์อื่นๆ เรียกใช้ฐานข้อมูลได้ผ่าน database.DB
var DB *gorm.DB

func Connect() {
	// ดึงค่าเชื่อมต่อมาจาก .env หรือ docker-compose
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("❌ DB_DSN environment variable is not set")
	}

	// เปิดการเชื่อมต่อ
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		// ตั้งค่าให้แสดง Log SQL ตอน Dev (ถ้าขึ้น Production สามารถเปลี่ยนเป็น logger.Silent)
		Logger: logger.Default.LogMode(logger.Info), 
	})

	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// ---------------------------------------------------------
	// 🛠️ Production Ready: ตั้งค่า Connection Pool
	// ---------------------------------------------------------
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("❌ Failed to get database instance: %v", err)
	}

	// จำนวน Connection ที่ให้เปิดแช่รอไว้เลย เพื่อความรวดเร็ว
	sqlDB.SetMaxIdleConns(10)
	
	// จำนวน Connection สูงสุดที่ยอมให้ทำงานพร้อมกัน (ป้องกัน DB ล่ม)
	sqlDB.SetMaxOpenConns(100)
	
	// อายุสูงสุดของแต่ละ Connection ก่อนที่จะถูกเคลียร์ทิ้งแล้วสร้างใหม่
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	log.Println("✅ MySQL Database connected successfully")
}