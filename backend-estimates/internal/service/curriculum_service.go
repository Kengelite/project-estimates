package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strings"

	"gorm.io/gorm"
)

type CurriculumService struct {
	Repo *repository.CurriculumRepository
}

func NewCurriculumService(repo *repository.CurriculumRepository) *CurriculumService {
	return &CurriculumService{Repo: repo}
}

const (
	CurriculumGroupBachelorNormal  = "bachelor_normal"
	CurriculumGroupBachelorSpecial = "bachelor_special"
	CurriculumGroupGraduate        = "graduate"
)

type CurriculumSplitInput struct {
	SplitGroup string  `json:"splitGroup"`
	PctSplit   float64 `json:"pctSplit"`
}

type CreateCurriculumInput struct {
	Name   string                 `json:"name"`
	Status string                 `json:"status"`
	Splits []CurriculumSplitInput `json:"splits"`
}

type UpdateCurriculumInput struct {
	Name   string                 `json:"name"`
	Status string                 `json:"status"`
	Splits []CurriculumSplitInput `json:"splits"`
}

type UpdateCurriculumStatusInput struct {
	Status string `json:"status"`
}

type CurriculumResponse struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Status          string  `json:"status"`
	BachelorNormal  float64 `json:"bachelorNormal"`
	BachelorSpecial float64 `json:"bachelorSpecial"`
	Graduate        float64 `json:"graduate"`
}

func roundCurriculum2(v float64) float64 {
	return math.Round(v*100) / 100
}

func normalizeCurriculumName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeCurriculumStatus(value string) string {
	return strings.TrimSpace(value)
}

func validCurriculumGroup(group string) bool {
	switch group {
	case CurriculumGroupBachelorNormal, CurriculumGroupBachelorSpecial, CurriculumGroupGraduate:
		return true
	default:
		return false
	}
}

func normalizeCurriculumSplits(inputs []CurriculumSplitInput) ([]CurriculumSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]CurriculumSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.SplitGroup = strings.TrimSpace(input.SplitGroup)
		input.PctSplit = roundCurriculum2(input.PctSplit)

		if input.SplitGroup == "" {
			return nil, errors.New("กรุณาระบุกลุ่มสัดส่วน")
		}

		if !validCurriculumGroup(input.SplitGroup) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		if seen[input.SplitGroup] {
			return nil, errors.New("พบกลุ่มสัดส่วนซ้ำ")
		}
		seen[input.SplitGroup] = true

		if input.PctSplit < 0 {
			return nil, errors.New("เปอร์เซ็นต์หักแบ่งต้องไม่น้อยกว่า 0")
		}

		result = append(result, input)
	}

	requiredGroups := []string{
		CurriculumGroupBachelorNormal,
		CurriculumGroupBachelorSpecial,
		CurriculumGroupGraduate,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ตรี(ปกติ) ตรี(พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildCurriculumSplitModels(inputs []CurriculumSplitInput) []models.CurriculumSplit {
	result := make([]models.CurriculumSplit, 0, len(inputs))
	for _, input := range inputs {
		result = append(result, models.CurriculumSplit{
			SplitGroup: input.SplitGroup,
			PctSplit:   input.PctSplit,
		})
	}
	return result
}

func mapCurriculumResponse(item *models.Curriculum) CurriculumResponse {
	response := CurriculumResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
	}

	for _, split := range item.Splits {
		switch split.SplitGroup {
		case CurriculumGroupBachelorNormal:
			response.BachelorNormal = split.PctSplit
		case CurriculumGroupBachelorSpecial:
			response.BachelorSpecial = split.PctSplit
		case CurriculumGroupGraduate:
			response.Graduate = split.PctSplit
		}
	}

	return response
}

func (s *CurriculumService) GetAll() ([]CurriculumResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]CurriculumResponse, 0, len(items))
	for i := range items {
		result = append(result, mapCurriculumResponse(&items[i]))
	}

	return result, nil
}

func (s *CurriculumService) Create(input CreateCurriculumInput) (*CurriculumResponse, error) {
	input.Name = normalizeCurriculumName(input.Name)
	input.Status = normalizeCurriculumStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อหลักสูตร")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่อหลักสูตรต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeCurriculumSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อหลักสูตรนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.Curriculum{
		Name:   input.Name,
		Status: input.Status,
	}

	splits := buildCurriculumSplitModels(normalizedSplits)

	if err := s.Repo.CreateWithSplits(item, splits); err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCurriculumResponse(created)
	return &resp, nil
}

func (s *CurriculumService) Update(id string, input UpdateCurriculumInput) (*CurriculumResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return nil, err
	}

	input.Name = normalizeCurriculumName(input.Name)
	input.Status = normalizeCurriculumStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อหลักสูตร")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่อหลักสูตรต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeCurriculumSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อหลักสูตรนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Name = input.Name
	item.Status = input.Status

	splits := buildCurriculumSplitModels(normalizedSplits)

	if err := s.Repo.UpdateWithSplits(item, splits); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCurriculumResponse(updated)
	return &resp, nil
}

func (s *CurriculumService) UpdateStatus(id string, input UpdateCurriculumStatusInput) (*CurriculumResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return nil, err
	}

	input.Status = normalizeCurriculumStatus(input.Status)

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

	resp := mapCurriculumResponse(updated)
	return &resp, nil
}

func (s *CurriculumService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return err
	}

	return s.Repo.Delete(id)
}