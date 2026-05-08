package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CentralSplit struct {
	ID         uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CentralID  uuid.UUID      `gorm:"type:char(36);not null;index" json:"centralId"`
	Central    Central        `gorm:"foreignKey:CentralID;references:ID" json:"central"`
	SplitGroup string         `gorm:"type:varchar(50);not null" json:"splitGroup"` // bachelor_normal, bachelor_special, graduate
	PctSplit   float64        `gorm:"type:decimal(10,2);default:0" json:"pctSplit"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (c *CentralSplit) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}