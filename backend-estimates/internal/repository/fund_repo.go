package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type FundRepository struct {
	DB *gorm.DB
}

func NewFundRepository(db *gorm.DB) *FundRepository {
	return &FundRepository{DB: db}
}

func (r *FundRepository) GetAll() ([]models.Fund, error) {
	var items []models.Fund
	err := r.DB.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *FundRepository) GetByID(id string) (*models.Fund, error) {
	var item models.Fund
	err := r.DB.First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *FundRepository) GetByName(name string) (*models.Fund, error) {
	var item models.Fund
	err := r.DB.Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *FundRepository) Create(item *models.Fund) error {
	return r.DB.Create(item).Error
}

func (r *FundRepository) Update(item *models.Fund) error {
	return r.DB.Save(item).Error
}

func (r *FundRepository) Delete(id string) error {
	return r.DB.Delete(&models.Fund{}, "id = ?", id).Error
}