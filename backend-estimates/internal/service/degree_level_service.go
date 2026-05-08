package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type DegreeLevelService struct {
	Repo *repository.DegreeLevelRepository
}

func NewDegreeLevelService(repo *repository.DegreeLevelRepository) *DegreeLevelService {
	return &DegreeLevelService{Repo: repo}
}

type CreateDegreeLevelInput struct {
	SectionID int    `json:"section_id"`
	Name      string `json:"name"`
	ShortName string `json:"short_name"`
	Status    string `json:"status"`
}

type UpdateDegreeLevelInput struct {
	SectionID int    `json:"section_id"`
	Name      string `json:"name"`
	ShortName string `json:"short_name"`
	Status    string `json:"status"`
}

type UpdateDegreeLevelStatusInput struct {
	Status string `json:"status"`
}

func (s *DegreeLevelService) GetAll() ([]models.DegreeLevel, error) {
	return s.Repo.GetAll()
}

func (s *DegreeLevelService) Create(input CreateDegreeLevelInput) (*models.DegreeLevel, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.ShortName = strings.TrimSpace(input.ShortName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SectionID <= 0 {
		return nil, errors.New("กรุณาเลือกโครงการระดับปริญญา")
	}

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อระดับปริญญา")
	}

	if input.ShortName == "" {
		return nil, errors.New("กรุณากรอกชื่อย่อ")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	// เช็กซ้ำเฉพาะในโครงการเดียวกัน
	existing, err := s.Repo.GetBySectionIDAndName(input.SectionID, input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อระดับปริญญานี้มีอยู่แล้วในโครงการที่เลือก")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.DegreeLevel{
		SectionID: input.SectionID,
		Name:      input.Name,
		ShortName: input.ShortName,
		Status:    input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *DegreeLevelService) Update(id string, input UpdateDegreeLevelInput) (*models.DegreeLevel, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลระดับปริญญา")
		}
		return nil, err
	}

	input.Name = strings.TrimSpace(input.Name)
	input.ShortName = strings.TrimSpace(input.ShortName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SectionID <= 0 {
		return nil, errors.New("กรุณาเลือกโครงการระดับปริญญา")
	}

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อระดับปริญญา")
	}

	if input.ShortName == "" {
		return nil, errors.New("กรุณากรอกชื่อย่อ")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	// เช็กซ้ำเฉพาะในโครงการเดียวกัน
	existing, err := s.Repo.GetBySectionIDAndName(input.SectionID, input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อระดับปริญญานี้มีอยู่แล้วในโครงการที่เลือก")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.SectionID = input.SectionID
	item.Name = input.Name
	item.ShortName = input.ShortName
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *DegreeLevelService) UpdateStatus(id string, input UpdateDegreeLevelStatusInput) (*models.DegreeLevel, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลระดับปริญญา")
		}
		return nil, err
	}

	input.Status = strings.TrimSpace(input.Status)
	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *DegreeLevelService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลระดับปริญญา")
		}
		return err
	}

	return s.Repo.Delete(id)
}