package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type YearService struct {
	Repo *repository.YearRepository
}

func NewYearService(repo *repository.YearRepository) *YearService {
	return &YearService{Repo: repo}
}

type CreateYearInput struct {
	Year   string `json:"year"`
	Status string `json:"status"`
}

type UpdateYearInput struct {
	Year   string `json:"year"`
	Status string `json:"status"`
}

type UpdateYearStatusInput struct {
	Status string `json:"status"`
}

func (s *YearService) GetAll() ([]models.Year, error) {
	return s.Repo.GetAll()
}

func (s *YearService) Create(input CreateYearInput) (*models.Year, error) {
	input.Year = strings.TrimSpace(input.Year)
	input.Status = strings.TrimSpace(input.Status)

	if input.Year == "" {
		return nil, errors.New("กรุณากรอกปีการศึกษา")
	}

	if len(input.Year) != 4 {
		return nil, errors.New("ปีการศึกษาต้องมี 4 หลัก")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByYear(input.Year)
	if err == nil && existing != nil {
		return nil, errors.New("ปีการศึกษานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	year := &models.Year{
		Year:   input.Year,
		Status: input.Status,
	}

	if err := s.Repo.Create(year); err != nil {
		return nil, err
	}

	return year, nil
}

func (s *YearService) Update(id int, input UpdateYearInput) (*models.Year, error) {
	year, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลปีการศึกษา")
		}
		return nil, err
	}

	input.Year = strings.TrimSpace(input.Year)
	input.Status = strings.TrimSpace(input.Status)

	if input.Year == "" {
		return nil, errors.New("กรุณากรอกปีการศึกษา")
	}

	if len(input.Year) != 4 {
		return nil, errors.New("ปีการศึกษาต้องมี 4 หลัก")
	}

	if input.Status == "" {
		input.Status = year.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByYear(input.Year)
	if err == nil && existing != nil && existing.ID != id {
		return nil, errors.New("ปีการศึกษานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	year.Year = input.Year
	year.Status = input.Status

	if err := s.Repo.Update(year); err != nil {
		return nil, err
	}

	return year, nil
}

func (s *YearService) UpdateStatus(id int, input UpdateYearStatusInput) (*models.Year, error) {
	year, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลปีการศึกษา")
		}
		return nil, err
	}

	input.Status = strings.TrimSpace(input.Status)

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	year.Status = input.Status

	if err := s.Repo.Update(year); err != nil {
		return nil, err
	}

	return year, nil
}

func (s *YearService) Delete(id int) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลปีการศึกษา")
		}
		return err
	}

	return s.Repo.Delete(id)
}