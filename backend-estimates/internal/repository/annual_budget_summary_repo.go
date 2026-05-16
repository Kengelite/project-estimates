package repository

import (
	"backend-estimates/internal/models"

	"gorm.io/gorm"
)

type AnnualBudgetSummaryRepository struct {
	DB *gorm.DB
}

func NewAnnualBudgetSummaryRepository(db *gorm.DB) *AnnualBudgetSummaryRepository {
	return &AnnualBudgetSummaryRepository{DB: db}
}

func (r *AnnualBudgetSummaryRepository) Create(
	summary *models.AnnualBudgetSummary,
	courses []models.AnnualBudgetSummaryCourse,
	detailsByCourseIndex map[int][]models.AnnualBudgetSummaryDetail,
) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(summary).Error; err != nil {
			return err
		}

		for i := range courses {
			courses[i].SummaryID = summary.ID

			if err := tx.Create(&courses[i]).Error; err != nil {
				return err
			}

			details := detailsByCourseIndex[i]

			for j := range details {
				details[j].SummaryCourseID = courses[i].ID
			}

			if len(details) > 0 {
				if err := tx.Create(&details).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (r *AnnualBudgetSummaryRepository) GetAll() ([]models.AnnualBudgetSummary, error) {
	var items []models.AnnualBudgetSummary

	err := r.DB.
		Preload("Year").
		Preload("Semester").
		Preload("CreatedBy").
		Preload("Courses", func(db *gorm.DB) *gorm.DB {
			return db.
				Where("annual_budget_summary_courses.deleted_at IS NULL").
				Order("annual_budget_summary_courses.created_at ASC")
		}).
		Preload("Courses.Course").
		Preload("Courses.Details", func(db *gorm.DB) *gorm.DB {
			return db.
				Where("annual_budget_summary_details.deleted_at IS NULL").
				Order("annual_budget_summary_details.created_at ASC")
		}).
		Where("annual_budget_summaries.deleted_at IS NULL").
		Order("annual_budget_summaries.created_at DESC").
		Find(&items).Error

	return items, err
}

func (r *AnnualBudgetSummaryRepository) GetByID(id string) (*models.AnnualBudgetSummary, error) {
	var item models.AnnualBudgetSummary

	err := r.DB.
		Preload("Year").
		Preload("Semester").
		Preload("CreatedBy").
		Preload("Courses", func(db *gorm.DB) *gorm.DB {
			return db.
				Where("annual_budget_summary_courses.deleted_at IS NULL").
				Order("annual_budget_summary_courses.created_at ASC")
		}).
		Preload("Courses.Course").
		Preload("Courses.Details", func(db *gorm.DB) *gorm.DB {
			return db.
				Where("annual_budget_summary_details.deleted_at IS NULL").
				Order("annual_budget_summary_details.created_at ASC")
		}).
		Where("annual_budget_summaries.deleted_at IS NULL").
		First(&item, "annual_budget_summaries.id = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *AnnualBudgetSummaryRepository) UpdateStatus(id string, status string) error {
	return r.DB.
		Model(&models.AnnualBudgetSummary{}).
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Update("status", status).Error
}

func (r *AnnualBudgetSummaryRepository) Delete(id string) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		var courses []models.AnnualBudgetSummaryCourse

		if err := tx.
			Where("summary_id = ?", id).
			Where("deleted_at IS NULL").
			Find(&courses).Error; err != nil {
			return err
		}

		for _, course := range courses {
			if err := tx.
				Where("summary_course_id = ?", course.ID).
				Delete(&models.AnnualBudgetSummaryDetail{}).Error; err != nil {
				return err
			}
		}

		if err := tx.
			Where("summary_id = ?", id).
			Delete(&models.AnnualBudgetSummaryCourse{}).Error; err != nil {
			return err
		}

		if err := tx.
			Delete(&models.AnnualBudgetSummary{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})
}