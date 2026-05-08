package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseStructure struct {
	ID                uuid.UUID       `gorm:"type:char(36);primaryKey" json:"id"`
	CourseID          uuid.UUID       `gorm:"type:char(36);not null" json:"courseId"`
	Course            Course          `gorm:"foreignKey:CourseID;references:ID" json:"course"`
	SubjectCategoryID uuid.UUID       `gorm:"type:char(36);not null" json:"subjectCategoryId"`
	SubjectCategory   SubjectCategory `gorm:"foreignKey:SubjectCategoryID;references:ID" json:"subjectCategory"`
	Credit            int             `gorm:"type:int(11);default:0" json:"credit"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (c *CourseStructure) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}