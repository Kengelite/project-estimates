package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UniversityWork struct {
	ID        uuid.UUID             `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string                `gorm:"type:varchar(150);not null" json:"name"`
	Status    string                `gorm:"type:varchar(1);default:'1'" json:"status"`
	Splits    []UniversityWorkSplit `gorm:"foreignKey:UniversityWorkID;references:ID" json:"splits"`
	CreatedAt time.Time             `json:"created_at"`
	UpdatedAt time.Time             `json:"updated_at"`
	DeletedAt gorm.DeletedAt        `gorm:"index" json:"deleted_at,omitempty"`
}

func (u *UniversityWork) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}