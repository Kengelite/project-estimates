package repository

import (
	"backend-estimates/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseRepository struct {
	DB *gorm.DB
}

func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{DB: db}
}

func (r *CourseRepository) GetAll() ([]models.Course, error) {
	var items []models.Course

	err := r.DB.
		Preload("DegreeLevel").
		Preload("DegreeLevel.Section").
		Preload("Structures", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("Structures.SubjectCategory").
		Preload("SubjectOutsideDeducts", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("SubjectOutsideDeducts.SubjectOutside").
		Preload("Students", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("year_id ASC")
		}).
		Preload("Students.Year").
		Where("deleted_at IS NULL").
		Order("created_at DESC").
		Find(&items).Error

	return items, err
}

func (r *CourseRepository) GetByID(id string) (*models.Course, error) {
	var item models.Course

	if err := r.DB.
		Preload("DegreeLevel").
		Preload("DegreeLevel.Section").
		Preload("Students", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("year_id ASC")
		}).
		Preload("Students.Year").
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		First(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *CourseRepository) GetByIDWithRelations(id string) (*models.Course, error) {
	var item models.Course

	if err := r.DB.
		Preload("DegreeLevel").
		Preload("DegreeLevel.Section").
		Preload("Structures", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("Structures.SubjectCategory").
		Preload("SubjectOutsideDeducts", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("SubjectOutsideDeducts.SubjectOutside").
		Preload("Students", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("year_id ASC")
		}).
		Preload("Students.Year").
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		First(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *CourseRepository) Delete(id string) error {
	return r.DB.Where("id = ?", id).Delete(&models.Course{}).Error
}

func (r *CourseRepository) UpdateStatus(id string, status string) error {
	return r.DB.Model(&models.Course{}).
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Update("status", status).Error
}

func (r *CourseRepository) ExistsByID(id string) (bool, error) {
	_, err := uuid.Parse(id)
	if err != nil {
		return false, err
	}

	var count int64
	if err := r.DB.Model(&models.Course{}).
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}