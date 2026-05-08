package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type UniversityWorkRepository struct {
	DB *gorm.DB
}

func NewUniversityWorkRepository(db *gorm.DB) *UniversityWorkRepository {
	return &UniversityWorkRepository{DB: db}
}

func (r *UniversityWorkRepository) GetAll() ([]models.UniversityWork, error) {
	var items []models.UniversityWork
	err := r.DB.
		Preload("Splits").
		Order("created_at DESC").
		Find(&items).Error
	return items, err
}

func (r *UniversityWorkRepository) GetByID(id string) (*models.UniversityWork, error) {
	var item models.UniversityWork
	err := r.DB.
		Preload("Splits").
		First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *UniversityWorkRepository) GetByName(name string) (*models.UniversityWork, error) {
	var item models.UniversityWork
	err := r.DB.Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *UniversityWorkRepository) CreateWithSplits(item *models.UniversityWork, splits []models.UniversityWorkSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(item).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].UniversityWorkID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *UniversityWorkRepository) UpdateWithSplits(item *models.UniversityWork, splits []models.UniversityWorkSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(item).Error; err != nil {
			return err
		}

		if err := tx.Unscoped().
			Where("university_work_id = ?", item.ID).
			Delete(&models.UniversityWorkSplit{}).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].UniversityWorkID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *UniversityWorkRepository) Update(item *models.UniversityWork) error {
	return r.DB.Save(item).Error
}

func (r *UniversityWorkRepository) Delete(id string) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Unscoped().
			Where("university_work_id = ?", id).
			Delete(&models.UniversityWorkSplit{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&models.UniversityWork{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})
}
