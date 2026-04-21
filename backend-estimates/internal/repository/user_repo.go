package repository

import (
	"backend-estimates/internal/models"
	"backend-estimates/pkg/database"
)

// สร้าง User ใหม่
func CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

// ค้นหา User จาก Email
func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.DB.Preload("Role").Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}