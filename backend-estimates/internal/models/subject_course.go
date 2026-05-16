package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubjectCourse struct {
	ID               uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	SubjectID        uuid.UUID      `gorm:"type:char(36);not null;index:idx_subject_course_unique,unique" json:"subjectId"`
	Subject          Subject        `gorm:"foreignKey:SubjectID;references:ID" json:"subject"`
	CourseID         uuid.UUID      `gorm:"type:char(36);not null;index:idx_subject_course_unique,unique" json:"courseId"`
	Course           Course         `gorm:"foreignKey:CourseID;references:ID" json:"course"`
	PricePerStudent  float64        `gorm:"column:price_per_student;type:decimal(10,2);default:0" json:"pricePerStudent"`
	RegisteredCount  int            `gorm:"column:registered_count;type:int(11);default:0" json:"registeredCount"`
	Status           string         `gorm:"column:status;type:varchar(1);default:'1'" json:"status"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (s *SubjectCourse) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}