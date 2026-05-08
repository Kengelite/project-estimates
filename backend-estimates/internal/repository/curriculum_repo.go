package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type CurriculumRepository struct {
	DB *gorm.DB
}

func NewCurriculumRepository(db *gorm.DB) *CurriculumRepository {
	return &CurriculumRepository{DB: db}
}

func (r *CurriculumRepository) GetAll() ([]models.Curriculum, error) {
	var items []models.Curriculum
	err := r.DB.
		Preload("Splits").
		Order("created_at DESC").
		Find(&items).Error
	return items, err
}

func (r *CurriculumRepository) GetByID(id string) (*models.Curriculum, error) {
	var item models.Curriculum
	err := r.DB.
		Preload("Splits").
		First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CurriculumRepository) GetByName(name string) (*models.Curriculum, error) {
	var item models.Curriculum
	err := r.DB.Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CurriculumRepository) CreateWithSplits(item *models.Curriculum, splits []models.CurriculumSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(item).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].CurriculumID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *CurriculumRepository) UpdateWithSplits(item *models.Curriculum, splits []models.CurriculumSplit) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(item).Error; err != nil {
			return err
		}

		if err := tx.Unscoped().
			Where("curriculum_id = ?", item.ID).
			Delete(&models.CurriculumSplit{}).Error; err != nil {
			return err
		}

		for i := range splits {
			splits[i].CurriculumID = item.ID
		}

		if len(splits) > 0 {
			if err := tx.Create(&splits).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *CurriculumRepository) Update(item *models.Curriculum) error {
	return r.DB.Save(item).Error
}

func (r *CurriculumRepository) Delete(id string) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Unscoped().
			Where("curriculum_id = ?", id).
			Delete(&models.CurriculumSplit{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&models.Curriculum{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})
}