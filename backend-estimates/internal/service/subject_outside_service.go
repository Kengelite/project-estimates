package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

type SubjectOutsideService struct {
	Repo *repository.SubjectOutsideRepository
}

func NewSubjectOutsideService(repo *repository.SubjectOutsideRepository) *SubjectOutsideService {
	return &SubjectOutsideService{Repo: repo}
}

type CreateSubjectOutsideInput struct {
	SubjectCode string `json:"subjectCode"`
	SubjectName string `json:"subjectName"`
	Status      string `json:"status"`
}

type UpdateSubjectOutsideInput struct {
	SubjectCode string `json:"subjectCode"`
	SubjectName string `json:"subjectName"`
	Status      string `json:"status"`
}

type UpdateSubjectOutsideStatusInput struct {
	Status string `json:"status"`
}

func (s *SubjectOutsideService) GetAll() ([]models.SubjectOutside, error) {
	return s.Repo.GetAll()
}

func (s *SubjectOutsideService) Create(input CreateSubjectOutsideInput) (*models.SubjectOutside, error) {
	input.SubjectCode = strings.TrimSpace(strings.ToUpper(input.SubjectCode))
	input.SubjectName = strings.TrimSpace(input.SubjectName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SubjectCode == "" {
		return nil, errors.New("กรุณากรอกรหัสวิชานอกคณะ")
	}

	if len(input.SubjectCode) > 2 {
		return nil, errors.New("รหัสวิชานอกคณะต้องไม่เกิน 2 ตัวอักษร")
	}

	if input.SubjectName == "" {
		return nil, errors.New("กรุณากรอกชื่อวิชานอกคณะ")
	}

	if len(input.SubjectName) > 100 {
		return nil, errors.New("ชื่อวิชานอกคณะต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existingCode, err := s.Repo.GetBySubjectCode(input.SubjectCode)
	if err == nil && existingCode != nil {
		return nil, errors.New("รหัสวิชานอกคณะนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	existingName, err := s.Repo.GetBySubjectName(input.SubjectName)
	if err == nil && existingName != nil {
		return nil, errors.New("ชื่อวิชานอกคณะนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.SubjectOutside{
		SubjectCode: input.SubjectCode,
		SubjectName: input.SubjectName,
		Status:      input.Status,
	}

	if err := s.Repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SubjectOutsideService) Update(id string, input UpdateSubjectOutsideInput) (*models.SubjectOutside, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลวิชานอกคณะ")
		}
		return nil, err
	}

	input.SubjectCode = strings.TrimSpace(strings.ToUpper(input.SubjectCode))
	input.SubjectName = strings.TrimSpace(input.SubjectName)
	input.Status = strings.TrimSpace(input.Status)

	if input.SubjectCode == "" {
		return nil, errors.New("กรุณากรอกรหัสวิชานอกคณะ")
	}

	if len(input.SubjectCode) > 2 {
		return nil, errors.New("รหัสวิชานอกคณะต้องไม่เกิน 2 ตัวอักษร")
	}

	if input.SubjectName == "" {
		return nil, errors.New("กรุณากรอกชื่อวิชานอกคณะ")
	}

	if len(input.SubjectName) > 100 {
		return nil, errors.New("ชื่อวิชานอกคณะต้องไม่เกิน 100 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	existingCode, err := s.Repo.GetBySubjectCode(input.SubjectCode)
	if err == nil && existingCode != nil && existingCode.ID != item.ID {
		return nil, errors.New("รหัสวิชานอกคณะนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	existingName, err := s.Repo.GetBySubjectName(input.SubjectName)
	if err == nil && existingName != nil && existingName.ID != item.ID {
		return nil, errors.New("ชื่อวิชานอกคณะนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.SubjectCode = input.SubjectCode
	item.SubjectName = input.SubjectName
	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *SubjectOutsideService) UpdateStatus(id string, input UpdateSubjectOutsideStatusInput) (*models.SubjectOutside, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลวิชานอกคณะ")
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

func (s *SubjectOutsideService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลวิชานอกคณะ")
		}
		return err
	}

	return s.Repo.Delete(id)
}