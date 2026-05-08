package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type SemesterService struct {
	Repo *repository.SemesterRepository
}

func NewSemesterService(repo *repository.SemesterRepository) *SemesterService {
	return &SemesterService{Repo: repo}
}

type CreateSemesterInput struct {
	Semester string `json:"semester"`
	Status   string `json:"status"`
}

type UpdateSemesterInput struct {
	Semester string `json:"semester"`
	Status   string `json:"status"`
}

type UpdateSemesterStatusInput struct {
	Status string `json:"status"`
}

func (s *SemesterService) GetAll() ([]models.Semester, error) {
	return s.Repo.GetAll()
}

func (s *SemesterService) Create(input CreateSemesterInput) (*models.Semester, error) {
	input.Semester = strings.TrimSpace(input.Semester)
	input.Status = strings.TrimSpace(input.Status)

	if input.Semester == "" {
		return nil, errors.New("กรุณากรอกชื่อภาคการศึกษา")
	}

	if len(input.Semester) > 100 {
		return nil, errors.New("ชื่อภาคการศึกษาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetBySemesterName(input.Semester)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อภาคการศึกษานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.Semester{
		Semester: input.Semester,
		Status:   input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SemesterService) Update(id int, input UpdateSemesterInput) (*models.Semester, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลภาคการศึกษา")
		}
		return nil, err
	}

	input.Semester = strings.TrimSpace(input.Semester)
	input.Status = strings.TrimSpace(input.Status)

	if input.Semester == "" {
		return nil, errors.New("กรุณากรอกชื่อภาคการศึกษา")
	}

	if len(input.Semester) > 100 {
		return nil, errors.New("ชื่อภาคการศึกษาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetBySemesterName(input.Semester)
	if err == nil && existing != nil && existing.ID != id {
		return nil, errors.New("ชื่อภาคการศึกษานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Semester = input.Semester
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SemesterService) UpdateStatus(id int, input UpdateSemesterStatusInput) (*models.Semester, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลภาคการศึกษา")
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

func (s *SemesterService) Delete(id int) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลภาคการศึกษา")
		}
		return err
	}

	return s.Repo.Delete(id)
}