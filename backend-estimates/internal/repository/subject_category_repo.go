package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type SubjectCategoryRepository struct {
	DB *gorm.DB
}

func NewSubjectCategoryRepository(db *gorm.DB) *SubjectCategoryRepository {
	return &SubjectCategoryRepository{DB: db}
}

func (r *SubjectCategoryRepository) GetAll() ([]models.SubjectCategory, error) {
	var items []models.SubjectCategory
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *SubjectCategoryRepository) GetByID(id string) (*models.SubjectCategory, error) {
	var item models.SubjectCategory
	err := r.DB.First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SubjectCategoryRepository) GetByName(name string) (*models.SubjectCategory, error) {
	var item models.SubjectCategory
	err := r.DB.Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SubjectCategoryRepository) Create(item *models.SubjectCategory) error {
	return r.DB.Create(item).Error
}

func (r *SubjectCategoryRepository) Update(item *models.SubjectCategory) error {
	return r.DB.Save(item).Error
}

func (r *SubjectCategoryRepository) Delete(id string) error {
	return r.DB.Delete(&models.SubjectCategory{}, "id = ?", id).Error
}