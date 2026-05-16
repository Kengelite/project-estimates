package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnnualBudgetSummaryCourse struct {
	ID                      uuid.UUID                   `gorm:"type:char(36);primaryKey" json:"id"`
	SummaryID               uuid.UUID                   `gorm:"type:char(36);not null;index" json:"summaryId"`
	Summary                 AnnualBudgetSummary         `gorm:"foreignKey:SummaryID;references:ID" json:"summary"`
	CourseID                *uuid.UUID                  `gorm:"type:char(36);index" json:"courseId,omitempty"`
	Course                  *Course                     `gorm:"foreignKey:CourseID;references:ID" json:"course,omitempty"`
	CourseNameSnapshot      string                      `gorm:"type:varchar(255);not null" json:"courseNameSnapshot"`
	CourseShortNameSnapshot string                      `gorm:"type:varchar(100);not null" json:"courseShortNameSnapshot"`
	SectionTitleSnapshot    string                      `gorm:"type:varchar(255);not null" json:"sectionTitleSnapshot"`
	InitialAmount           float64                     `gorm:"type:decimal(15,2);default:0" json:"initialAmount"`
	Step2DeductAmount       float64                     `gorm:"type:decimal(15,2);default:0" json:"step2DeductAmount"`
	Step2RemainingAmount    float64                     `gorm:"type:decimal(15,2);default:0" json:"step2RemainingAmount"`
	Step3DeductAmount       float64                     `gorm:"type:decimal(15,2);default:0" json:"step3DeductAmount"`
	Step3RemainingAmount    float64                     `gorm:"type:decimal(15,2);default:0" json:"step3RemainingAmount"`
	Step4DeductAmount       float64                     `gorm:"type:decimal(15,2);default:0" json:"step4DeductAmount"`
	Step4RemainingAmount    float64                     `gorm:"type:decimal(15,2);default:0" json:"step4RemainingAmount"`
	Step5DeductAmount       float64                     `gorm:"type:decimal(15,2);default:0" json:"step5DeductAmount"`
	Step5RemainingAmount    float64                     `gorm:"type:decimal(15,2);default:0" json:"step5RemainingAmount"`
	Step6DeductAmount       float64                     `gorm:"type:decimal(15,2);default:0" json:"step6DeductAmount"`
	FinalRemainingAmount    float64                     `gorm:"type:decimal(15,2);default:0" json:"finalRemainingAmount"`
	Details                 []AnnualBudgetSummaryDetail `gorm:"foreignKey:SummaryCourseID;references:ID" json:"details"`
	CreatedAt               time.Time                   `json:"created_at"`
	UpdatedAt               time.Time                   `json:"updated_at"`
	DeletedAt               gorm.DeletedAt              `gorm:"index" json:"deleted_at,omitempty"`
}

func (a *AnnualBudgetSummaryCourse) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
