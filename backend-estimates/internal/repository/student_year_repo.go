package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type StudentYearRepository struct {
	DB *gorm.DB
}

func NewStudentYearRepository(db *gorm.DB) *StudentYearRepository {
	return &StudentYearRepository{DB: db}
}

func (r *StudentYearRepository) GetAll() ([]models.StudentYear, error) {
	var items []models.StudentYear
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *StudentYearRepository) GetByID(id int) (*models.StudentYear, error) {
	var item models.StudentYear
	err := r.DB.First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *StudentYearRepository) GetByStudentYear(studentYear string) (*models.StudentYear, error) {
	var item models.StudentYear
	err := r.DB.Where("student_year = ?", studentYear).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *StudentYearRepository) Create(item *models.StudentYear) error {
	return r.DB.Create(item).Error
}

func (r *StudentYearRepository) Update(item *models.StudentYear) error {
	return r.DB.Save(item).Error
}

func (r *StudentYearRepository) Delete(id int) error {
	return r.DB.Delete(&models.StudentYear{}, id).Error
}