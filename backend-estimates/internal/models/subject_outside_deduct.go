package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubjectOutsideDeduct struct {
	ID               uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CourseID         uuid.UUID      `gorm:"type:char(36);not null" json:"courseId"`
	Course           Course         `gorm:"foreignKey:CourseID;references:ID" json:"course"`
	SubjectOutsideID uuid.UUID      `gorm:"type:char(36);not null" json:"subjectOutsideId"`
	SubjectOutside   SubjectOutside `gorm:"foreignKey:SubjectOutsideID;references:ID" json:"subjectOutside"`
	Amount           float64        `gorm:"type:decimal(10,2);default:0" json:"amount"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (s *SubjectOutsideDeduct) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}