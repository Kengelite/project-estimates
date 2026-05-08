package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Subject struct {
	ID               uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CourseID         uuid.UUID      `gorm:"type:char(36);not null" json:"courseId"`
	Course           Course         `gorm:"foreignKey:CourseID;references:ID" json:"course"`
	YearID           int            `gorm:"type:int(11);not null" json:"yearId"`
	Year             Year           `gorm:"foreignKey:YearID;references:ID" json:"year"`
	StudentYearID    int            `gorm:"type:int(11);not null" json:"studentYearId"`
	StudentYear      StudentYear    `gorm:"foreignKey:StudentYearID;references:ID" json:"studentYear"`
	SemesterID       int            `gorm:"type:int(11);not null" json:"semesterId"`
	Semester         Semester       `gorm:"foreignKey:SemesterID;references:ID" json:"semester"`
	AmountRegistered int            `gorm:"column:amount_registered;type:int(11);default:0" json:"amountRegistered"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (s *Subject) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}