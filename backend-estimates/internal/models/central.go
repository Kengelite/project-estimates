package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Central struct {
	ID            uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	Name          string         `gorm:"type:varchar(150);not null" json:"name"`
	Status        string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	Splits        []CentralSplit `gorm:"foreignKey:CentralID;references:ID" json:"splits"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (c *Central) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}