package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UniversityWorkService struct {
	Repo *repository.UniversityWorkRepository
}

func NewUniversityWorkService(repo *repository.UniversityWorkRepository) *UniversityWorkService {
	return &UniversityWorkService{Repo: repo}
}

const (
	UniversityWorkGroupBachelorNormalName  = "ป.ตรี (ปกติ)"
	UniversityWorkGroupBachelorSpecialName = "ป.ตรี (พิเศษ)"
	UniversityWorkGroupGraduateName        = "บัณฑิต"
)

type UniversityWorkSplitInput struct {
	SplitGroupID string  `json:"splitGroupId"`
	SplitGroup   string  `json:"splitGroup"`
	PctSplit     float64 `json:"pctSplit"`
}

type CreateUniversityWorkInput struct {
	Name   string                     `json:"name"`
	Status string                     `json:"status"`
	Splits []UniversityWorkSplitInput `json:"splits"`
}

type UpdateUniversityWorkInput struct {
	Name   string                     `json:"name"`
	Status string                     `json:"status"`
	Splits []UniversityWorkSplitInput `json:"splits"`
}

type UpdateUniversityWorkStatusInput struct {
	Status string `json:"status"`
}

type UniversityWorkSplitGroupResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

type UniversityWorkSplitResponse struct {
	ID               string                           `json:"id"`
	UniversityWorkID string                           `json:"universityWorkId"`
	SplitGroupID     string                           `json:"splitGroupId"`
	SplitGroup       UniversityWorkSplitGroupResponse `json:"splitGroup"`
	PctSplit         float64                          `json:"pctSplit"`
}

type UniversityWorkResponse struct {
	ID              string                        `json:"id"`
	Name            string                        `json:"name"`
	Status          string                        `json:"status"`
	BachelorNormal  float64                       `json:"bachelorNormal"`
	BachelorSpecial float64                       `json:"bachelorSpecial"`
	Graduate        float64                       `json:"graduate"`
	Splits          []UniversityWorkSplitResponse `json:"splits"`
}

type resolvedUniversityWorkSplitInput struct {
	SplitGroupID uuid.UUID
	SplitGroup   models.SplitGroup
	PctSplit     float64
}

func roundUniversityWork2(v float64) float64 {
	return math.Round(v*100) / 100
}

func normalizeUniversityWorkName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeUniversityWorkStatus(value string) string {
	return strings.TrimSpace(value)
}

func normalizeUniversityWorkGroupName(value string) string {
	value = strings.TrimSpace(value)

	switch value {
	case "bachelor_normal", "bachelor normal", "normal", "ปกติ", "ตรีปกติ", "ป.ตรีปกติ", "ป.ตรี (ปกติ)":
		return UniversityWorkGroupBachelorNormalName

	case "bachelor_special", "bachelor special", "special", "พิเศษ", "ตรีพิเศษ", "ป.ตรีพิเศษ", "ป.ตรี (พิเศษ)":
		return UniversityWorkGroupBachelorSpecialName

	case "graduate", "grad", "บัณฑิต", "บัณฑิตศึกษา", "ป.โท", "ป.เอก":
		return UniversityWorkGroupGraduateName

	default:
		return value
	}
}

func validUniversityWorkGroupName(name string) bool {
	switch name {
	case UniversityWorkGroupBachelorNormalName, UniversityWorkGroupBachelorSpecialName, UniversityWorkGroupGraduateName:
		return true
	default:
		return false
	}
}

func (s *UniversityWorkService) findSplitGroupByID(id uuid.UUID) (*models.SplitGroup, error) {
	var item models.SplitGroup

	err := s.Repo.DB.
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Where("status = ?", 1).
		First(&item).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (s *UniversityWorkService) findSplitGroupByName(name string) (*models.SplitGroup, error) {
	var item models.SplitGroup

	err := s.Repo.DB.
		Where("name = ?", name).
		Where("deleted_at IS NULL").
		Where("status = ?", 1).
		First(&item).Error

	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (s *UniversityWorkService) resolveSplitGroup(input UniversityWorkSplitInput) (*models.SplitGroup, error) {
	splitGroupID := strings.TrimSpace(input.SplitGroupID)
	splitGroupName := normalizeUniversityWorkGroupName(input.SplitGroup)

	if splitGroupID != "" {
		id, err := uuid.Parse(splitGroupID)
		if err != nil {
			return nil, errors.New("รหัสกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		splitGroup, err := s.findSplitGroupByID(id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("ไม่พบกลุ่มสัดส่วน")
			}
			return nil, err
		}

		splitGroup.Name = normalizeUniversityWorkGroupName(splitGroup.Name)

		if !validUniversityWorkGroupName(splitGroup.Name) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		return splitGroup, nil
	}

	if splitGroupName == "" {
		return nil, errors.New("กรุณาระบุกลุ่มสัดส่วน")
	}

	if id, err := uuid.Parse(splitGroupName); err == nil {
		splitGroup, err := s.findSplitGroupByID(id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("ไม่พบกลุ่มสัดส่วน")
			}
			return nil, err
		}

		splitGroup.Name = normalizeUniversityWorkGroupName(splitGroup.Name)

		if !validUniversityWorkGroupName(splitGroup.Name) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		return splitGroup, nil
	}

	if !validUniversityWorkGroupName(splitGroupName) {
		return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
	}

	splitGroup, err := s.findSplitGroupByName(splitGroupName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบกลุ่มสัดส่วน")
		}
		return nil, err
	}

	return splitGroup, nil
}

func (s *UniversityWorkService) normalizeUniversityWorkSplits(inputs []UniversityWorkSplitInput) ([]resolvedUniversityWorkSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]resolvedUniversityWorkSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.PctSplit = roundUniversityWork2(input.PctSplit)

		if input.PctSplit < 0 {
			return nil, errors.New("เปอร์เซ็นต์หักแบ่งต้องไม่น้อยกว่า 0")
		}

		if input.PctSplit > 100 {
			return nil, errors.New("เปอร์เซ็นต์หักแบ่งต้องไม่เกิน 100")
		}

		splitGroup, err := s.resolveSplitGroup(input)
		if err != nil {
			return nil, err
		}

		groupName := normalizeUniversityWorkGroupName(splitGroup.Name)

		if !validUniversityWorkGroupName(groupName) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		if seen[groupName] {
			return nil, errors.New("พบกลุ่มสัดส่วนซ้ำ")
		}

		seen[groupName] = true

		result = append(result, resolvedUniversityWorkSplitInput{
			SplitGroupID: splitGroup.ID,
			SplitGroup:   *splitGroup,
			PctSplit:     input.PctSplit,
		})
	}

	requiredGroups := []string{
		UniversityWorkGroupBachelorNormalName,
		UniversityWorkGroupBachelorSpecialName,
		UniversityWorkGroupGraduateName,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ป.ตรี (ปกติ), ป.ตรี (พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildUniversityWorkSplitModels(inputs []resolvedUniversityWorkSplitInput) []models.UniversityWorkSplit {
	result := make([]models.UniversityWorkSplit, 0, len(inputs))

	for _, input := range inputs {
		result = append(result, models.UniversityWorkSplit{
			SplitGroupID: input.SplitGroupID,
			PctSplit:     input.PctSplit,
		})
	}

	return result
}

func mapUniversityWorkSplitGroupResponse(item models.SplitGroup) UniversityWorkSplitGroupResponse {
	return UniversityWorkSplitGroupResponse{
		ID:          item.ID.String(),
		Name:        item.Name,
		Description: item.Description,
		Status:      item.Status,
	}
}

func mapUniversityWorkSplitResponse(split models.UniversityWorkSplit) UniversityWorkSplitResponse {
	return UniversityWorkSplitResponse{
		ID:               split.ID.String(),
		UniversityWorkID: split.UniversityWorkID.String(),
		SplitGroupID:     split.SplitGroupID.String(),
		SplitGroup:       mapUniversityWorkSplitGroupResponse(split.SplitGroup),
		PctSplit:         split.PctSplit,
	}
}

func mapUniversityWorkResponse(item *models.UniversityWork) UniversityWorkResponse {
	response := UniversityWorkResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
		Splits: make([]UniversityWorkSplitResponse, 0, len(item.Splits)),
	}

	for _, split := range item.Splits {
		response.Splits = append(response.Splits, mapUniversityWorkSplitResponse(split))

		groupName := normalizeUniversityWorkGroupName(split.SplitGroup.Name)

		switch groupName {
		case UniversityWorkGroupBachelorNormalName:
			response.BachelorNormal = split.PctSplit
		case UniversityWorkGroupBachelorSpecialName:
			response.BachelorSpecial = split.PctSplit
		case UniversityWorkGroupGraduateName:
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

	normalizedSplits, err := s.normalizeUniversityWorkSplits(input.Splits)
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

	normalizedSplits, err := s.normalizeUniversityWorkSplits(input.Splits)
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