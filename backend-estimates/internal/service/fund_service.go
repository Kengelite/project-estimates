package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strings"

	"gorm.io/gorm"
)

type FundService struct {
	Repo *repository.FundRepository
}

func NewFundService(repo *repository.FundRepository) *FundService {
	return &FundService{Repo: repo}
}

type CreateFundInput struct {
	Name     string  `json:"name"`
	PctSplit float64 `json:"pctSplit"`
	Status   string  `json:"status"`
}

type UpdateFundInput struct {
	Name     string  `json:"name"`
	PctSplit float64 `json:"pctSplit"`
	Status   string  `json:"status"`
}

type UpdateFundStatusInput struct {
	Status string `json:"status"`
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

func (s *FundService) GetAll() ([]models.Fund, error) {
	return s.Repo.GetAll()
}

func (s *FundService) Create(input CreateFundInput) (*models.Fund, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Status = strings.TrimSpace(input.Status)
	input.PctSplit = round2(input.PctSplit)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อแหล่งทุน")
	}

	if len(input.Name) > 255 {
		return nil, errors.New("ชื่อแหล่งทุนต้องไม่เกิน 255 ตัวอักษร")
	}

	if input.PctSplit < 0 {
		return nil, errors.New("ร้อยละการแบ่งต้องไม่น้อยกว่า 0")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อแหล่งทุนนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.Fund{
		Name:     input.Name,
		PctSplit: input.PctSplit,
		Status:   input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *FundService) Update(id string, input UpdateFundInput) (*models.Fund, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลแหล่งทุน")
		}
		return nil, err
	}

	input.Name = strings.TrimSpace(input.Name)
	input.Status = strings.TrimSpace(input.Status)
	input.PctSplit = round2(input.PctSplit)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อแหล่งทุน")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่อแหล่งทุนต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.PctSplit < 0 {
		return nil, errors.New("ร้อยละการแบ่งต้องไม่น้อยกว่า 0")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อแหล่งทุนนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Name = input.Name
	item.PctSplit = input.PctSplit
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *FundService) UpdateStatus(id string, input UpdateFundStatusInput) (*models.Fund, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลแหล่งทุน")
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

func (s *FundService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลแหล่งทุน")
		}
		return err
	}

	return s.Repo.Delete(id)
}