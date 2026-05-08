package models

import (
	"time"

	"gorm.io/gorm"
)

type Year struct {
	ID        int            `gorm:"primaryKey;autoIncrement;type:int(11)" json:"id"`
	Year      string         `gorm:"column:year;type:varchar(4);not null" json:"year"`
	Status    string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
