package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type SectionRepository struct {
	DB *gorm.DB
}

func NewSectionRepository(db *gorm.DB) *SectionRepository {
	return &SectionRepository{DB: db}
}

func (r *SectionRepository) GetAll() ([]models.Section, error) {
	var items []models.Section
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *SectionRepository) GetByID(id int) (*models.Section, error) {
	var item models.Section
	err := r.DB.First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SectionRepository) GetBySectionName(sectionName string) (*models.Section, error) {
	var item models.Section
	err := r.DB.Where("section_name = ?", sectionName).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SectionRepository) Create(item *models.Section) error {
	return r.DB.Create(item).Error
}

func (r *SectionRepository) Update(item *models.Section) error {
	return r.DB.Save(item).Error
}

func (r *SectionRepository) Delete(id int) error {
	return r.DB.Delete(&models.Section{}, id).Error
}