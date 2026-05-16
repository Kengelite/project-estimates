package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Subject struct {
	ID               uuid.UUID       `gorm:"type:char(36);primaryKey" json:"id"`
	YearID           int             `gorm:"type:int(11);not null" json:"yearId"`
	Year             Year            `gorm:"foreignKey:YearID;references:ID" json:"year"`
	StudentYearID    int             `gorm:"type:int(11);not null" json:"studentYearId"`
	StudentYear      StudentYear     `gorm:"foreignKey:StudentYearID;references:ID" json:"studentYear"`
	SemesterID       int             `gorm:"type:int(11);not null" json:"semesterId"`
	Semester         Semester        `gorm:"foreignKey:SemesterID;references:ID" json:"semester"`
	SubjectOutsideID string          `gorm:"column:subject_outside_id;type:char(36);not null" json:"subjectOutsideId"`
	SubjectOutside   SubjectOutside  `gorm:"foreignKey:SubjectOutsideID" json:"subjectOutside,omitempty"`
	SubjectCode      string          `gorm:"column:subject_code;type:varchar(8);not null" json:"subjectCode"`
	SubjectName      string          `gorm:"column:subject_name;type:varchar(255);not null" json:"subjectName"`
	Status           string          `gorm:"column:status;type:varchar(1);default:'1'" json:"status"`
	SubjectCourses   []SubjectCourse `gorm:"foreignKey:SubjectID;references:ID" json:"subjectCourses"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

func (s *Subject) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}
