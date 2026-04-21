package service

import (
	"errors"
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"

	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(user *models.User) error {
    // จังหวะนี้แหละ! bcrypt ทำงานตรงนี้
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Pwd), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    // เอารหัสที่ Hash แล้ว เขียนทับรหัสดิบในตัวแปร user ตัวเดิม
    user.Pwd = string(hashedPassword) 

    // แล้วค่อยส่ง user (ที่รหัสเป็น Hash แล้ว) ไปบันทึกลง DB
    return repository.CreateUser(user)
}

func LoginUser(email, password string) (string, error) {
    // 1. หา User จาก Email
    user, err := repository.GetUserByEmail(email)
    if err != nil {
        fmt.Printf("❌ Login Error: User with email %s not found\n", email)
        return "", errors.New("invalid email or password")
    }

    // --- ส่วนที่เพิ่มเพื่อดูการ Hash สดๆ ---
    fmt.Println("-------------------------------------------")
    fmt.Printf("🔍 Debug Login for: %s\n", email)
    fmt.Printf("📥 1. Password from Client (Plain): %s\n", password)
    fmt.Printf("🗄️  2. Hash in Database: %s\n", user.Pwd)

    // ลองเอา password ที่ส่งมาไป Hash ใหม่ดู (เพื่อดูว่าหน้าตามันจะต่างจากใน DB แค่ไหน)
    newHash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    fmt.Printf("✨ 3. New Hash from current password: %s\n", string(newHash))
    fmt.Println("-------------------------------------------")
    // ----------------------------------------

    // 2. เทียบรหัสผ่าน (ใช้ฟังก์ชันของ bcrypt)
    err = bcrypt.CompareHashAndPassword([]byte(user.Pwd), []byte(password))
    
    if err != nil {
        fmt.Printf("🧨 Compare Result: FAILED (Reason: %v)\n", err)
        // ตรวจสอบเพิ่มเติม: ถ้า Hash ใน DB สั้นผิดปกติ (ไม่ใช่ 60 ตัว) ให้เตือน
        if len(user.Pwd) < 60 {
            fmt.Printf("⚠️  Warning: Hash in DB is too short (%d chars). It might be truncated!\n", len(user.Pwd))
        }
        fmt.Println("-------------------------------------------")
        return "", errors.New("invalid email or password")
    }

    fmt.Printf("✅ Compare Result: SUCCESS\n")
    fmt.Println("-------------------------------------------")

    // 3. สร้าง JWT Token
    token, err := GenerateToken(user.ID, user.Role.Name)
    if err != nil {
        return "", err
    }

    return token, nil
}