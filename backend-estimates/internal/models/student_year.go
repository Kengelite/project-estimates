package models

import (
	"time"

	"gorm.io/gorm"
)

type StudentYear struct {
	ID          int            `gorm:"primaryKey;autoIncrement;type:int(11)" json:"id"`
	StudentYear string         `gorm:"column:student_year;type:varchar(1);not null" json:"studentYear"`
	Status      string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}