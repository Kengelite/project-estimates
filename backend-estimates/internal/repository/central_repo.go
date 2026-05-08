package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type CentralRepository struct {
	DB *gorm.DB
}

func NewCentralRepository(db *gorm.DB) *CentralRepository {
	return &CentralRepository{DB: db}
}

func (r *CentralRepository) GetAll() ([]models.Central, error) {
	var items []models.Central
	err := r.DB.
		Preload("Splits").
		Order("created_at DESC").
		Find(&items).Error
	return items, err
}

func (r *CentralRepository) GetByID(id string) (*models.Central, error) {
	var item models.Central
	err := r.DB.
		Preload("Splits").
		First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CentralRepository) GetByName(name string) (*models.Central, error) {
	var item models.Central
	err := r.DB.Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CentralRepository) CreateWithSplits(item *models.Central, splits []models.CentralSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(item).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].CentralID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *CentralRepository) UpdateWithSplits(item *models.Central, splits []models.CentralSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(item).Error; err != nil {
			return err
		}

		if err := tx.Where("central_id = ?", item.ID).Delete(&models.CentralSplit{}).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].CentralID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *CentralRepository) Update(item *models.Central) error {
	return r.DB.Save(item).Error
}

func (r *CentralRepository) Delete(id string) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("central_id = ?", id).Delete(&models.CentralSplit{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&models.Central{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})
}