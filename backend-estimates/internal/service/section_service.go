package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type SectionService struct {
	Repo *repository.SectionRepository
}

func NewSectionService(repo *repository.SectionRepository) *SectionService {
	return &SectionService{Repo: repo}
}

type CreateSectionInput struct {
	SectionName string `json:"section_name"`
	Status      string `json:"status"`
}

type UpdateSectionInput struct {
	SectionName string `json:"section_name"`
	Status      string `json:"status"`
}

type UpdateSectionStatusInput struct {
	Status string `json:"status"`
}

func (s *SectionService) GetAll() ([]models.Section, error) {
	return s.Repo.GetAll()
}

func (s *SectionService) Create(input CreateSectionInput) (*models.Section, error) {
	input.SectionName = strings.TrimSpace(input.SectionName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SectionName == "" {
		return nil, errors.New("กรุณากรอกชื่อโครงการระดับปริญญา")
	}

	if len(input.SectionName) > 100 {
		return nil, errors.New("ชื่อโครงการระดับปริญญาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetBySectionName(input.SectionName)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อโครงการระดับปริญญานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.Section{
		SectionName: input.SectionName,
		Status:      input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SectionService) Update(id int, input UpdateSectionInput) (*models.Section, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลโครงการระดับปริญญา")
		}
		return nil, err
	}

	input.SectionName = strings.TrimSpace(input.SectionName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SectionName == "" {
		return nil, errors.New("กรุณากรอกชื่อโครงการระดับปริญญา")
	}

	if len(input.SectionName) > 100 {
		return nil, errors.New("ชื่อโครงการระดับปริญญาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetBySectionName(input.SectionName)
	if err == nil && existing != nil && existing.ID != id {
		return nil, errors.New("ชื่อโครงการระดับปริญญานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.SectionName = input.SectionName
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SectionService) UpdateStatus(id int, input UpdateSectionStatusInput) (*models.Section, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลโครงการระดับปริญญา")
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

func (s *SectionService) Delete(id int) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลโครงการระดับปริญญา")
		}
		return err
	}

	return s.Repo.Delete(id)
}