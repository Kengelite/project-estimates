package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	Fname     string         `gorm:"type:varchar(100)" json:"fname"`
	Lname     string         `gorm:"type:varchar(100)" json:"lname"`
	Email     string         `gorm:"type:varchar(150);unique;not null" json:"email"`
	Pwd 	  string 		 `gorm:"type:varchar(255)" json:"pwd"`
	RoleID    uuid.UUID      `gorm:"type:char(36);not null" json:"roleId"`
	Role      Role           `gorm:"foreignKey:RoleID" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Hook: ให้ Go สร้าง UUID ให้ก่อนบันทึกลง MySQL
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}