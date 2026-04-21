package service

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GenerateToken รับ ID และ Role เข้ามาเพื่อแปลงเป็น JWT Token
func GenerateToken(userID uuid.UUID, roleName string) (string, error) {
	// 1. กำหนดข้อมูลที่จะเก็บไว้ใน Payload (Claims)
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    roleName,
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // Token หมดอายุใน 3 วัน
	}

	// 2. สร้าง Token ด้วยอัลกอริทึม HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 3. เซ็น Token ด้วย Secret Key จากไฟล์ .env
	secret := []byte(os.Getenv("JWT_SECRET"))
	signedToken, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}