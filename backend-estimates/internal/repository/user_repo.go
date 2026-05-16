package repository

import (
	"backend-estimates/internal/models"
	"backend-estimates/pkg/database"

	"gorm.io/gorm"
)

/*
|--------------------------------------------------------------------------
| ของเดิมที่ระบบ Auth/Login ใช้อยู่
|--------------------------------------------------------------------------
*/

func CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User

	err := database.DB.
		Preload("Role").
		Where("email = ?", email).
		Where("deleted_at IS NULL").
		First(&user).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}

/*
|--------------------------------------------------------------------------
| Repository สำหรับหน้า จัดการผู้ใช้งาน
|--------------------------------------------------------------------------
*/

type UserRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	var items []models.User

	err := r.DB.
		Preload("Role").
		Where("users.deleted_at IS NULL").
		Order("users.created_at DESC").
		Find(&items).Error

	return items, err
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	var item models.User

	err := r.DB.
		Preload("Role").
		Where("users.deleted_at IS NULL").
		First(&item, "users.id = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var item models.User

	err := r.DB.
		Preload("Role").
		Where("users.email = ?", email).
		Where("users.deleted_at IS NULL").
		First(&item).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *UserRepository) Create(item *models.User) error {
	return r.DB.Create(item).Error
}

func (r *UserRepository) Update(item *models.User) error {
	return r.DB.Save(item).Error
}

func (r *UserRepository) Delete(id string) error {
	return r.DB.Delete(&models.User{}, "id = ?", id).Error
}

func (r *UserRepository) GetRoles() ([]models.Role, error) {
	var items []models.Role

	err := r.DB.
		Where("roles.deleted_at IS NULL").
		Order("roles.created_at ASC").
		Find(&items).Error

	return items, err
}

func (r *UserRepository) GetRoleByID(id string) (*models.Role, error) {
	var item models.Role

	err := r.DB.
		Where("roles.deleted_at IS NULL").
		First(&item, "roles.id = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}