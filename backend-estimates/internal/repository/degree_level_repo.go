package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type DegreeLevelRepository struct {
	DB *gorm.DB
}

func NewDegreeLevelRepository(db *gorm.DB) *DegreeLevelRepository {
	return &DegreeLevelRepository{DB: db}
}

func (r *DegreeLevelRepository) GetAll() ([]models.DegreeLevel, error) {
	var items []models.DegreeLevel
	err := r.DB.Preload("Section").Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *DegreeLevelRepository) GetByID(id string) (*models.DegreeLevel, error) {
	var item models.DegreeLevel
	err := r.DB.Preload("Section").First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *DegreeLevelRepository) GetBySectionIDAndName(sectionID int, name string) (*models.DegreeLevel, error) {
	var item models.DegreeLevel
	err := r.DB.
		Where("section_id = ? AND name = ?", sectionID, name).
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *DegreeLevelRepository) Create(item *models.DegreeLevel) error {
	return r.DB.Create(item).Error
}

func (r *DegreeLevelRepository) Update(item *models.DegreeLevel) error {
	return r.DB.Save(item).Error
}

func (r *DegreeLevelRepository) Delete(id string) error {
	return r.DB.Delete(&models.DegreeLevel{}, "id = ?", id).Error
}