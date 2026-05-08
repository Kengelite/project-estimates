package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Course struct {
	ID            uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	DegreeLevelID uuid.UUID      `gorm:"type:char(36);not null" json:"degreeLevelId"`
	DegreeLevel   DegreeLevel    `gorm:"foreignKey:DegreeLevelID;references:ID" json:"degreeLevel"`
	NameTH        string         `gorm:"column:name_th;type:varchar(255);not null" json:"nameTh"`
	NameEN        string         `gorm:"column:name_en;type:varchar(255)" json:"nameEn"`
	ShortName     string         `gorm:"column:short_name;type:varchar(10)" json:"shortName"`
	StudyDuration int            `gorm:"column:study_duration;type:int(11);default:0" json:"studyDuration"`
	TuitionFees   float64        `gorm:"column:tuition_fees;type:decimal(10,2);default:0" json:"tuitionFees"`
	DeductToUni   float64        `gorm:"column:deduct_to_uni;type:decimal(10,2);default:0" json:"deductToUni"`
	Status        string         `gorm:"type:varchar(1);default:'1'" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (c *Course) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}