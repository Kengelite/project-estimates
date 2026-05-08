package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type YearRepository struct {
	DB *gorm.DB
}

func NewYearRepository(db *gorm.DB) *YearRepository {
	return &YearRepository{DB: db}
}

func (r *YearRepository) GetAll() ([]models.Year, error) {
	var years []models.Year
	err := r.DB.Order("year DESC").Find(&years).Error
	return years, err
}

func (r *YearRepository) GetByID(id int) (*models.Year, error) {
	var year models.Year
	err := r.DB.First(&year, id).Error
	if err != nil {
		return nil, err
	}
	return &year, nil
}

func (r *YearRepository) GetByYear(yearValue string) (*models.Year, error) {
	var year models.Year
	err := r.DB.Where("year = ?", yearValue).First(&year).Error
	if err != nil {
		return nil, err
	}
	return &year, nil
}

func (r *YearRepository) Create(year *models.Year) error {
	return r.DB.Create(year).Error
}

func (r *YearRepository) Update(year *models.Year) error {
	return r.DB.Save(year).Error
}

func (r *YearRepository) Delete(id int) error {
	return r.DB.Delete(&models.Year{}, id).Error
}