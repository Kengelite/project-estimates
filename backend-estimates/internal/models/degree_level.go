package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DegreeLevel struct {
	ID        uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	SectionID int            `gorm:"type:int(11);not null" json:"sectionId"`
	Section   Section        `gorm:"foreignKey:SectionID;references:ID" json:"section"`
	Name      string         `gorm:"type:varchar(150);not null" json:"name"`
	ShortName string         `gorm:"type:varchar(10)" json:"shortName"`
	Status    string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (d *DegreeLevel) BeforeCreate(tx *gorm.DB) (err error) {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return
}