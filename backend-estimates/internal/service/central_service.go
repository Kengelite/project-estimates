package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strings"

	"gorm.io/gorm"
)

type CentralService struct {
	Repo *repository.CentralRepository
}

func NewCentralService(repo *repository.CentralRepository) *CentralService {
	return &CentralService{Repo: repo}
}

const (
	CentralGroupBachelorNormal  = "bachelor_normal"
	CentralGroupBachelorSpecial = "bachelor_special"
	CentralGroupGraduate        = "graduate"
)

type CentralSplitInput struct {
	SplitGroup string  `json:"splitGroup"`
	PctSplit   float64 `json:"pctSplit"`
}

type CreateCentralInput struct {
	Name   string              `json:"name"`
	Status string              `json:"status"`
	Splits []CentralSplitInput `json:"splits"`
}

type UpdateCentralInput struct {
	Name   string              `json:"name"`
	Status string              `json:"status"`
	Splits []CentralSplitInput `json:"splits"`
}

type UpdateCentralStatusInput struct {
	Status string `json:"status"`
}

type CentralResponse struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Status          string  `json:"status"`
	BachelorNormal  float64 `json:"bachelorNormal"`
	BachelorSpecial float64 `json:"bachelorSpecial"`
	Graduate        float64 `json:"graduate"`
}

func round__2(v float64) float64 {
	return math.Round(v*100) / 100
}

func normalizeName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeStatus(value string) string {
	return strings.TrimSpace(value)
}

func validCentralGroup(group string) bool {
	switch group {
	case CentralGroupBachelorNormal, CentralGroupBachelorSpecial, CentralGroupGraduate:
		return true
	default:
		return false
	}
}

func normalizeSplits(inputs []CentralSplitInput) ([]CentralSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]CentralSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.SplitGroup = strings.TrimSpace(input.SplitGroup)
		input.PctSplit = round__2(input.PctSplit)

		if input.SplitGroup == "" {
			return nil, errors.New("กรุณาระบุกลุ่มสัดส่วน")
		}

		if !validCentralGroup(input.SplitGroup) {
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
		CentralGroupBachelorNormal,
		CentralGroupBachelorSpecial,
		CentralGroupGraduate,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ตรี(ปกติ) ตรี(พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildSplitModels(inputs []CentralSplitInput) []models.CentralSplit {
	result := make([]models.CentralSplit, 0, len(inputs))
	for _, input := range inputs {
		result = append(result, models.CentralSplit{
			SplitGroup: input.SplitGroup,
			PctSplit:   input.PctSplit,
		})
	}
	return result
}

func mapCentralResponse(item *models.Central) CentralResponse {
	response := CentralResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
	}

	for _, split := range item.Splits {
		switch split.SplitGroup {
		case CentralGroupBachelorNormal:
			response.BachelorNormal = split.PctSplit
		case CentralGroupBachelorSpecial:
			response.BachelorSpecial = split.PctSplit
		case CentralGroupGraduate:
			response.Graduate = split.PctSplit
		}
	}

	return response
}

func (s *CentralService) GetAll() ([]CentralResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]CentralResponse, 0, len(items))
	for i := range items {
		result = append(result, mapCentralResponse(&items[i]))
	}

	return result, nil
}

func (s *CentralService) Create(input CreateCentralInput) (*CentralResponse, error) {
	input.Name = normalizeName(input.Name)
	input.Status = normalizeStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อส่วนกลาง")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่อส่วนกลางต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = "1"
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อส่วนกลางนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item := &models.Central{
		Name:   input.Name,
		Status: input.Status,
	}

	splits := buildSplitModels(normalizedSplits)

	if err := s.Repo.CreateWithSplits(item, splits); err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCentralResponse(created)
	return &resp, nil
}

func (s *CentralService) Update(id string, input UpdateCentralInput) (*CentralResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลส่วนกลาง")
		}
		return nil, err
	}

	input.Name = normalizeName(input.Name)
	input.Status = normalizeStatus(input.Status)

	if input.Name == "" {
		return nil, errors.New("กรุณากรอกชื่อส่วนกลาง")
	}

	if len(input.Name) > 150 {
		return nil, errors.New("ชื่อส่วนกลางต้องไม่เกิน 150 ตัวอักษร")
	}

	if input.Status == "" {
		input.Status = item.Status
	}

	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	normalizedSplits, err := normalizeSplits(input.Splits)
	if err != nil {
		return nil, err
	}

	existing, err := s.Repo.GetByName(input.Name)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อส่วนกลางนี้มีอยู่แล้ว")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Name = input.Name
	item.Status = input.Status

	splits := buildSplitModels(normalizedSplits)

	if err := s.Repo.UpdateWithSplits(item, splits); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCentralResponse(updated)
	return &resp, nil
}

func (s *CentralService) UpdateStatus(id string, input UpdateCentralStatusInput) (*CentralResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลส่วนกลาง")
		}
		return nil, err
	}

	input.Status = normalizeStatus(input.Status)

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

	resp := mapCentralResponse(updated)
	return &resp, nil
}

func (s *CentralService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลส่วนกลาง")
		}
		return err
	}

	return s.Repo.Delete(id)
}