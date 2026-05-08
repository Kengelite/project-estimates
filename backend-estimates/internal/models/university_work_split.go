package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UniversityWorkSplit struct {
	ID               uuid.UUID        `gorm:"type:char(36);primaryKey" json:"id"`
	UniversityWorkID uuid.UUID        `gorm:"type:char(36);not null;index:idx_university_work_group,unique" json:"universityWorkId"`
	UniversityWork   UniversityWork   `gorm:"foreignKey:UniversityWorkID;references:ID" json:"universityWork"`
	SplitGroup       string           `gorm:"type:varchar(50);not null;index:idx_university_work_group,unique" json:"splitGroup"` // bachelor_normal, bachelor_special, graduate
	PctSplit         float64          `gorm:"type:decimal(10,2);default:0" json:"pctSplit"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`
	DeletedAt        gorm.DeletedAt   `gorm:"index" json:"deleted_at,omitempty"`
}

func (u *UniversityWorkSplit) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}