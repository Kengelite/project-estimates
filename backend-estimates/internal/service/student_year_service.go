package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type StudentYearService struct {
	Repo *repository.StudentYearRepository
}

func NewStudentYearService(repo *repository.StudentYearRepository) *StudentYearService {
	return &StudentYearService{Repo: repo}
}

type CreateStudentYearInput struct {
	StudentYear string `json:"studentYear"`
	Status      string `json:"status"`
}

type UpdateStudentYearInput struct {
	StudentYear string `json:"studentYear"`
	Status      string `json:"status"`
}

type UpdateStudentYearStatusInput struct {
	Status string `json:"status"`
}

func (s *StudentYearService) GetAll() ([]models.StudentYear, error) {
	return s.Repo.GetAll()
}

func (s *StudentYearService) Create(input CreateStudentYearInput) (*models.StudentYear, error) {
	input.StudentYear = strings.TrimSpace(input.StudentYear)
	input.Status = strings.TrimSpace(input.Status)

	if input.StudentYear == "" {
		return nil, errors.New("กรุณากรอกชั้นปี")
	}

	if len(input.StudentYear) != 1 {
		return nil, errors.New("ชั้นปีต้องมี 1 ตัวอักษร")
	}

	if input.StudentYear < "1" || input.StudentYear > "9" {
		return nil, errors.New("ชั้นปีต้องเป็นตัวเลข 1-9")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByStudentYear(input.StudentYear)
	if err == nil && existing != nil {
		return nil, errors.New("ชั้นปีนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.StudentYear{
		StudentYear: input.StudentYear,
		Status:      input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *StudentYearService) Update(id int, input UpdateStudentYearInput) (*models.StudentYear, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลชั้นปี")
		}
		return nil, err
	}

	input.StudentYear = strings.TrimSpace(input.StudentYear)
	input.Status = strings.TrimSpace(input.Status)

	if input.StudentYear == "" {
		return nil, errors.New("กรุณากรอกชั้นปี")
	}

	if len(input.StudentYear) != 1 {
		return nil, errors.New("ชั้นปีต้องมี 1 ตัวอักษร")
	}

	if input.StudentYear < "1" || input.StudentYear > "9" {
		return nil, errors.New("ชั้นปีต้องเป็นตัวเลข 1-9")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByStudentYear(input.StudentYear)
	if err == nil && existing != nil && existing.ID != id {
		return nil, errors.New("ชั้นปีนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.StudentYear = input.StudentYear
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *StudentYearService) UpdateStatus(id int, input UpdateStudentYearStatusInput) (*models.StudentYear, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลชั้นปี")
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

func (s *StudentYearService) Delete(id int) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลชั้นปี")
		}
		return err
	}

	return s.Repo.Delete(id)
}