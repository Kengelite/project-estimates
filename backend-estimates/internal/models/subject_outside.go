package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubjectOutside struct {
	ID          uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	SubjectCode string         `gorm:"column:subject_code;type:varchar(2);not null" json:"subjectCode"`
	SubjectName string         `gorm:"column:subject_name;type:varchar(100);not null" json:"subjectName"`
	Status      string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (s *SubjectOutside) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}