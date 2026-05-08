package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type SemesterRepository struct {
	DB *gorm.DB
}

func NewSemesterRepository(db *gorm.DB) *SemesterRepository {
	return &SemesterRepository{DB: db}
}

func (r *SemesterRepository) GetAll() ([]models.Semester, error) {
	var items []models.Semester
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *SemesterRepository) GetByID(id int) (*models.Semester, error) {
	var item models.Semester
	err := r.DB.First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SemesterRepository) GetBySemesterName(semester string) (*models.Semester, error) {
	var item models.Semester
	err := r.DB.Where("semester = ?", semester).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SemesterRepository) Create(item *models.Semester) error {
	return r.DB.Create(item).Error
}

func (r *SemesterRepository) Update(item *models.Semester) error {
	return r.DB.Save(item).Error
}

func (r *SemesterRepository) Delete(id int) error {
	return r.DB.Delete(&models.Semester{}, id).Error
}