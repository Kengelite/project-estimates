package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type SplitGroupRepository struct {
	DB *gorm.DB
}

func NewSplitGroupRepository(db *gorm.DB) *SplitGroupRepository {
	return &SplitGroupRepository{DB: db}
}

func (r *SplitGroupRepository) GetAll() ([]models.SplitGroup, error) {
	var items []models.SplitGroup

	err := r.DB.
		Where("deleted_at IS NULL").
		Order("created_at ASC").
		Find(&items).Error

	return items, err
}

func (r *SplitGroupRepository) GetActive() ([]models.SplitGroup, error) {
	var items []models.SplitGroup

	err := r.DB.
		Where("deleted_at IS NULL").
		Where("status = ?", 1).
		Order("created_at ASC").
		Find(&items).Error

	return items, err
}

func (r *SplitGroupRepository) GetByID(id string) (*models.SplitGroup, error) {
	var item models.SplitGroup

	err := r.DB.
		Where("deleted_at IS NULL").
		First(&item, "id = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *SplitGroupRepository) GetByName(name string) (*models.SplitGroup, error) {
	var item models.SplitGroup

	err := r.DB.
		Where("name = ?", name).
		Where("deleted_at IS NULL").
		First(&item).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}