package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type SubjectOutsideRepository struct {
	DB *gorm.DB
}

func NewSubjectOutsideRepository(db *gorm.DB) *SubjectOutsideRepository {
	return &SubjectOutsideRepository{DB: db}
}

func (r *SubjectOutsideRepository) GetAll() ([]models.SubjectOutside, error) {
	var items []models.SubjectOutside
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *SubjectOutsideRepository) GetByID(id string) (*models.SubjectOutside, error) {
	var item models.SubjectOutside
	err := r.DB.First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SubjectOutsideRepository) GetBySubjectCode(code string) (*models.SubjectOutside, error) {
	var item models.SubjectOutside
	err := r.DB.Where("subject_code = ?", code).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SubjectOutsideRepository) GetBySubjectName(name string) (*models.SubjectOutside, error) {
	var item models.SubjectOutside
	err := r.DB.Where("subject_name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SubjectOutsideRepository) Create(item *models.SubjectOutside) error {
	return r.DB.Create(item).Error
}

func (r *SubjectOutsideRepository) Update(item *models.SubjectOutside) error {
	return r.DB.Save(item).Error
}

func (r *SubjectOutsideRepository) Delete(id string) error {
	return r.DB.Delete(&models.SubjectOutside{}, "id = ?", id).Error
}