package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SplitGroup struct {
	ID          uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`            // ป.ตรี (ปกติ), ป.ตรี (พิเศษ), บัณฑิต
	Description string         `gorm:"type:varchar(255)" json:"description"`
	Status      int            `gorm:"type:tinyint;default:1" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (s *SplitGroup) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
