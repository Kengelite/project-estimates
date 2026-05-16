package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnnualBudgetSummary struct {
	ID                        uuid.UUID                   `gorm:"type:char(36);primaryKey" json:"id"`
	YearID                    uint                        `gorm:"not null;index" json:"yearId"`
	Year                      Year                        `gorm:"foreignKey:YearID;references:ID" json:"year"`
	SummaryType               string                      `gorm:"type:varchar(20);not null;index" json:"summaryType"` // yearly, semester
	SemesterID                *uint                       `gorm:"index" json:"semesterId,omitempty"`
	Semester                  *Semester                   `gorm:"foreignKey:SemesterID;references:ID" json:"semester,omitempty"`
	TotalUniversityWorkAmount float64                     `gorm:"type:decimal(15,2);default:0" json:"totalUniversityWorkAmount"`
	TotalCurriculumAmount     float64                     `gorm:"type:decimal(15,2);default:0" json:"totalCurriculumAmount"`
	Status                    string                      `gorm:"type:varchar(10);default:'1';index" json:"status"`
	CreatedByID               *uuid.UUID                  `gorm:"type:char(36);index" json:"createdById,omitempty"`
	CreatedBy                 *User                       `gorm:"foreignKey:CreatedByID;references:ID" json:"createdBy,omitempty"`
	Courses                   []AnnualBudgetSummaryCourse `gorm:"foreignKey:SummaryID;references:ID" json:"courses"`
	CreatedAt                 time.Time                   `json:"created_at"`
	UpdatedAt                 time.Time                   `json:"updated_at"`
	DeletedAt                 gorm.DeletedAt              `gorm:"index" json:"deleted_at,omitempty"`
}

func (a *AnnualBudgetSummary) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
