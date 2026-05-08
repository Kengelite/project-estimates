package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseStudent struct {
	ID            uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CourseID      uuid.UUID      `gorm:"type:char(36);not null" json:"courseId"`
	Course        Course         `gorm:"foreignKey:CourseID;references:ID" json:"course"`
	YearID        int            `gorm:"type:int(11);not null" json:"yearId"`
	Year          Year           `gorm:"foreignKey:YearID;references:ID" json:"year"`
	StudentAmount int            `gorm:"column:student_amount;type:int(11);default:0" json:"studentAmount"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (c *CourseStudent) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}