package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnnualBudgetSummaryDetail struct {
	ID              uuid.UUID                 `gorm:"type:char(36);primaryKey" json:"id"`
	SummaryCourseID uuid.UUID                 `gorm:"type:char(36);not null;index" json:"summaryCourseId"`
	SummaryCourse   AnnualBudgetSummaryCourse `gorm:"foreignKey:SummaryCourseID;references:ID" json:"summaryCourse"`
	Step            string                    `gorm:"type:varchar(20);not null;index" json:"step"`    // step4, step5, step6
	RefType         string                    `gorm:"type:varchar(50);not null;index" json:"refType"` // fund, central, university_work
	RefID           *uuid.UUID                `gorm:"type:char(36);index" json:"refId,omitempty"`
	NameSnapshot    string                    `gorm:"type:varchar(255);not null" json:"nameSnapshot"`
	Percent         float64                   `gorm:"type:decimal(10,2);default:0" json:"percent"`
	DeductAmount    float64                   `gorm:"type:decimal(15,2);default:0" json:"deductAmount"`
	CreatedAt       time.Time                 `json:"created_at"`
	UpdatedAt       time.Time                 `json:"updated_at"`
	DeletedAt       gorm.DeletedAt            `gorm:"index" json:"deleted_at,omitempty"`
}

func (a *AnnualBudgetSummaryDetail) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
