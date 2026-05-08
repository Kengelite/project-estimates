package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strings"

	"gorm.io/gorm"
)

type UniversityWorkService struct {
	Repo *repository.UniversityWorkRepository
}

func NewUniversityWorkService(repo *repository.UniversityWorkRepository) *UniversityWorkService {
	return &UniversityWorkService{Repo: repo}
}

const (
	UniversityWorkGroupBachelorNormal  = "bachelor_normal"
	UniversityWorkGroupBachelorSpecial = "bachelor_special"
	UniversityWorkGroupGraduate        = "graduate"
)

type UniversityWorkSplitInput struct {
	SplitGroup string  `json:"splitGroup"`
	PctSplit   float64 `json:"pctSplit"`
}

type CreateUniversityWorkInput struct {
	Name   string                   `json:"name"`
	Status string                   `json:"status"`
	Splits []UniversityWorkSplitInput `json:"splits"`
}

type UpdateUniversityWorkInput struct {
	Name   string                   `json:"name"`
	Status string                   `json:"status"`
	Splits []UniversityWorkSplitInput `json:"splits"`
}

type UpdateUniversityWorkStatusInput struct {
	Status string `json:"status"`
}

type UniversityWorkResponse struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Status          string  `json:"status"`
	BachelorNormal  float64 `json:"bachelorNormal"`
	BachelorSpecial float64 `json:"bachelorSpecial"`
	Graduate        float64 `json:"graduate"`
}

func roundUW2(v float64) float64 {
	return math.Round(v*100) / 100
}

func normalizeUniversityWorkName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeUniversityWorkStatus(value string) string {
	return strings.TrimSpace(value)
}

func validUniversityWorkGroup(group string) bool {
	switch group {
	case UniversityWorkGroupBachelorNormal, UniversityWorkGroupBachelorSpecial, UniversityWorkGroupGraduate:
		return true
	default:
		return false
	}
}

func normalizeUniversityWorkSplits(inputs []UniversityWorkSplitInput) ([]UniversityWorkSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]UniversityWorkSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.SplitGroup = strings.TrimSpace(input.SplitGroup)
		input.PctSplit = roundUW2(input.PctSplit)

		if input.SplitGroup == "" {
			return nil, errors.New("กรุณาระบุกลุ่มสัดส่วน")
		}

		if !validUniversityWorkGroup(input.SplitGroup) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		if seen[input.SplitGroup] {
			return nil, errors.New("พบกลุ่มสัดส่วนซ้ำ")
		}
		seen[input.SplitGroup] = true

		if input.PctSplit < 0 {
			return nil, errors.New("เปอร์เซ็นต์หักแบ่งต้องไม่น้อยกว่า 0")
		}

		if input.PctSplit > 100 {
			return nil, errors.New("เปอร์เซ็นต์หักแบ่งต้องไม่เกิน 100")
		}

		result = append(result, input)
	}

	requiredGroups := []string{
		UniversityWorkGroupBachelorNormal,
		UniversityWorkGroupBachelorSpecial,
		UniversityWorkGroupGraduate,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ตรี(ปกติ) ตรี(พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildUniversityWorkSplitModels(inputs []UniversityWorkSplitInput) []models.UniversityWorkSplit {
	result := make([]models.UniversityWorkSplit, 0, len(inputs))
	for _, input := range inputs {
		result = append(result, models.UniversityWorkSplit{
			SplitGroup: input.SplitGroup,
			PctSplit:   input.PctSplit,
		})
	}
	return result
}

func mapUniversityWorkResponse(item *models.UniversityWork) UniversityWorkResponse {
	response := UniversityWorkResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
	}

	for _, split := range item.Splits {
		switch split.SplitGroup {
		case UniversityWorkGroupBachelorNormal:
			response.BachelorNormal = split.PctSplit
		case UniversityWorkGroupBachelorSpecial:
			response.BachelorSpecial = split.PctSplit
		case UniversityWorkGroupGraduate:
			response.Graduate = split.PctSplit
		}
	}

	return response
}

func (s *UniversityWorkService) GetAll() ([]UniversityWorkResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]UniversityWorkResponse, 0, len(items))
	for i := range items {
		result = append(result, mapUniversityWorkResponse(&items[i]))
	}

	return result, nil
}

func (s *UniversityWorkService) Create(input CreateUniversityWorkInput) (*UniversityWorkResponse, error) {
	input.Name = normalizeUniversityWorkName(input.Name)
	input.Status = normalizeUniversityWorkStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่องานมหาวิทยาลัย")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่องานมหาวิทยาลัยต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeUniversityWorkSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่องานมหาวิทยาลัยนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.UniversityWork{
		Name:   input.Name,
		Status: input.Status,
	}

	splits := buildUniversityWorkSplitModels(normalizedSplits)

	if err := s.Repo.CreateWithSplits(item, splits); err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapUniversityWorkResponse(created)
	return &resp, nil
}

func (s *UniversityWorkService) Update(id string, input UpdateUniversityWorkInput) (*UniversityWorkResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลงานมหาวิทยาลัย")
		}
		return nil, err
	}

	input.Name = normalizeUniversityWorkName(input.Name)
	input.Status = normalizeUniversityWorkStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่องานมหาวิทยาลัย")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่องานมหาวิทยาลัยต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeUniversityWorkSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่องานมหาวิทยาลัยนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Name = input.Name
	item.Status = input.Status

	splits := buildUniversityWorkSplitModels(normalizedSplits)

	if err := s.Repo.UpdateWithSplits(item, splits); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapUniversityWorkResponse(updated)
	return &resp, nil
}

func (s *UniversityWorkService) UpdateStatus(id string, input UpdateUniversityWorkStatusInput) (*UniversityWorkResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลงานมหาวิทยาลัย")
		}
		return nil, err
	}

	input.Status = normalizeUniversityWorkStatus(input.Status)

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	item.Status = input.Status

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapUniversityWorkResponse(updated)
	return &resp, nil
}

func (s *UniversityWorkService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลงานมหาวิทยาลัย")
		}
		return err
	}

	return s.Repo.Delete(id)
}