package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role struct {
	ID        uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);unique;not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (r *Role) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}