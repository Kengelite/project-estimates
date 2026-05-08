package models

import (
	"time"

	"gorm.io/gorm"
)

type Section struct {
	ID          int            `gorm:"primaryKey;autoIncrement;type:int(11)" json:"id"`
	SectionName string         `gorm:"column:section_name;type:varchar(100);not null" json:"sectionName"`
	Status      string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}