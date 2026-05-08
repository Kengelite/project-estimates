package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type SubjectCategoryService struct {
	Repo *repository.SubjectCategoryRepository
}

func NewSubjectCategoryService(repo *repository.SubjectCategoryRepository) *SubjectCategoryService {
	return &SubjectCategoryService{Repo: repo}
}

type CreateSubjectCategoryInput struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

type UpdateSubjectCategoryInput struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

type UpdateSubjectCategoryStatusInput struct {
	Status string `json:"status"`
}

func (s *SubjectCategoryService) GetAll() ([]models.SubjectCategory, error) {
	return s.Repo.GetAll()
}

func (s *SubjectCategoryService) Create(input CreateSubjectCategoryInput) (*models.SubjectCategory, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Status = strings.TrimSpace(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อหมวดวิชา")
	}

	if len(input.Name) > 100 {
		return nil, errors.New("ชื่อหมวดวิชาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อหมวดวิชานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.SubjectCategory{
		Name:   input.Name,
		Status: input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SubjectCategoryService) Update(id string, input UpdateSubjectCategoryInput) (*models.SubjectCategory, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหมวดวิชา")
		}
		return nil, err
	}

	input.Name = strings.TrimSpace(input.Name)
	input.Status = strings.TrimSpace(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อหมวดวิชา")
	}

	if len(input.Name) > 100 {
		return nil, errors.New("ชื่อหมวดวิชาต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อหมวดวิชานี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Name = input.Name
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SubjectCategoryService) UpdateStatus(id string, input UpdateSubjectCategoryStatusInput) (*models.SubjectCategory, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหมวดวิชา")
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

func (s *SubjectCategoryService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลหมวดวิชา")
		}
		return err
	}

	return s.Repo.Delete(id)
}