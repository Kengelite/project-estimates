package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Fund struct {
	ID        uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(255);not null" json:"name"`
	PctSplit  float64        `gorm:"type:decimal(10,2);default:0" json:"pctSplit"`
	Status    string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (f *Fund) BeforeCreate(tx *gorm.DB) (err error) {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return
}