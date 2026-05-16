package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CurriculumSplit struct {
	ID           uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CurriculumID uuid.UUID      `gorm:"type:char(36);not null;index:idx_curriculum_split_group,unique" json:"curriculumId"`
	Curriculum   Curriculum     `gorm:"foreignKey:CurriculumID;references:ID" json:"curriculum"`
	SplitGroupID uuid.UUID      `gorm:"type:char(36);not null;index:idx_curriculum_split_group,unique" json:"splitGroupId"`
	SplitGroup   SplitGroup     `gorm:"foreignKey:SplitGroupID;references:ID" json:"splitGroup"`
	PctSplit     float64        `gorm:"type:decimal(10,2);default:0" json:"pctSplit"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (c *CurriculumSplit) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
