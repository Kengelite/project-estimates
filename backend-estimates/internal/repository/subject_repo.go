package repository

import (
	"backend-estimates/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubjectRepository struct {
	DB *gorm.DB
}

func NewSubjectRepository(db *gorm.DB) *SubjectRepository {
	return &SubjectRepository{DB: db}
}

func (r *SubjectRepository) GetAll() ([]models.Subject, error) {
	var items []models.Subject

	err := r.DB.
		Preload("Year").
		Preload("StudentYear").
		Preload("Semester").
		Preload("SubjectOutside").
		Preload("SubjectCourses", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("SubjectCourses.Course").
		Where("deleted_at IS NULL").
		Order("created_at DESC").
		Find(&items).Error

	return items, err
}

func (r *SubjectRepository) GetByID(id string) (*models.Subject, error) {
	var item models.Subject

	if err := r.DB.
		Preload("Year").
		Preload("StudentYear").
		Preload("Semester").
		Preload("SubjectOutside").
		Preload("SubjectCourses", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("created_at ASC")
		}).
		Preload("SubjectCourses.Course").
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		First(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *SubjectRepository) Create(item *models.Subject) error {
	return r.DB.Create(item).Error
}

func (r *SubjectRepository) Update(item *models.Subject) error {
	return r.DB.
		Model(&models.Subject{}).
		Where("id = ?", item.ID).
		Updates(map[string]interface{}{
			"year_id":            item.YearID,
			"student_year_id":    item.StudentYearID,
			"semester_id":        item.SemesterID,
			"subject_outside_id": item.SubjectOutsideID,
			"subject_code":       item.SubjectCode,
			"subject_name":       item.SubjectName,
			"status":             item.Status,
		}).Error
}

func (r *SubjectRepository) Delete(id string) error {
	tx := r.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.
		Where("subject_id = ?", id).
		Delete(&models.SubjectCourse{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.
		Where("id = ?", id).
		Delete(&models.Subject{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *SubjectRepository) ExistsByID(id string) (bool, error) {
	_, err := uuid.Parse(id)
	if err != nil {
		return false, err
	}

	var count int64
	if err := r.DB.
		Model(&models.Subject{}).
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *SubjectRepository) ExistsSubjectOutsideByID(id string) (bool, error) {
	_, err := uuid.Parse(id)
	if err != nil {
		return false, err
	}

	var count int64
	if err := r.DB.
		Model(&models.SubjectOutside{}).
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *SubjectRepository) FindDuplicate(
	yearID int,
	studentYearID int,
	semesterID int,
	subjectOutsideID string,
	subjectCode string,
	subjectName string,
) (*models.Subject, error) {
	var item models.Subject

	err := r.DB.
		Where("year_id = ?", yearID).
		Where("student_year_id = ?", studentYearID).
		Where("semester_id = ?", semesterID).
		Where("subject_outside_id = ?", subjectOutsideID).
		Where("subject_code = ?", subjectCode).
		Where("subject_name = ?", subjectName).
		Where("deleted_at IS NULL").
		First(&item).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *SubjectRepository) CreateWithCourses(item *models.Subject, courses []models.SubjectCourse) error {
	tx := r.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Create(item).Error; err != nil {
		tx.Rollback()
		return err
	}

	for i := range courses {
		courses[i].SubjectID = item.ID

		if err := tx.Create(&courses[i]).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (r *SubjectRepository) UpdateWithCourses(item *models.Subject, courses []models.SubjectCourse) error {
	tx := r.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.
		Model(&models.Subject{}).
		Where("id = ?", item.ID).
		Updates(map[string]interface{}{
			"year_id":            item.YearID,
			"student_year_id":    item.StudentYearID,
			"semester_id":        item.SemesterID,
			"subject_outside_id": item.SubjectOutsideID,
			"subject_code":       item.SubjectCode,
			"subject_name":       item.SubjectName,
			"status":             item.Status,
		}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.
		Where("subject_id = ?", item.ID).
		Delete(&models.SubjectCourse{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	for i := range courses {
		courses[i].SubjectID = item.ID

		var existing models.SubjectCourse

		err := tx.
			Unscoped().
			Where("subject_id = ?", item.ID).
			Where("course_id = ?", courses[i].CourseID).
			First(&existing).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := tx.Create(&courses[i]).Error; err != nil {
					tx.Rollback()
					return err
				}

				continue
			}

			tx.Rollback()
			return err
		}

		if err := tx.
			Unscoped().
			Model(&models.SubjectCourse{}).
			Where("id = ?", existing.ID).
			Updates(map[string]interface{}{
				"subject_id":         item.ID,
				"course_id":          courses[i].CourseID,
				"price_per_student":  courses[i].PricePerStudent,
				"registered_count":   courses[i].RegisteredCount,
				"status":             courses[i].Status,
				"deleted_at":         nil,
			}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (r *SubjectRepository) GetDeductAmount(courseID uuid.UUID, subjectOutsideID uuid.UUID) (float64, error) {
	var item models.SubjectOutsideDeduct

	err := r.DB.
		Where("course_id = ?", courseID).
		Where("subject_outside_id = ?", subjectOutsideID).
		Where("deleted_at IS NULL").
		First(&item).Error

	if err != nil {
		return 0, err
	}

	return item.Amount, nil
}