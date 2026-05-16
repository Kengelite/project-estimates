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

type CurriculumService struct {
	Repo *repository.CurriculumRepository
}

func NewCurriculumService(repo *repository.CurriculumRepository) *CurriculumService {
	return &CurriculumService{Repo: repo}
}

const (
	CurriculumGroupBachelorNormalName  = "ป.ตรี (ปกติ)"
	CurriculumGroupBachelorSpecialName = "ป.ตรี (พิเศษ)"
	CurriculumGroupGraduateName        = "บัณฑิต"
)

type CurriculumSplitInput struct {
	SplitGroupID string  `json:"splitGroupId"`
	SplitGroup   string  `json:"splitGroup"`
	PctSplit     float64 `json:"pctSplit"`
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

type CurriculumSplitGroupResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

type CurriculumSplitResponse struct {
	ID           string                       `json:"id"`
	CurriculumID string                       `json:"curriculumId"`
	SplitGroupID string                       `json:"splitGroupId"`
	SplitGroup   CurriculumSplitGroupResponse `json:"splitGroup"`
	PctSplit     float64                      `json:"pctSplit"`
}

type CurriculumResponse struct {
	ID              string                    `json:"id"`
	Name            string                    `json:"name"`
	Status          string                    `json:"status"`
	BachelorNormal  float64                   `json:"bachelorNormal"`
	BachelorSpecial float64                   `json:"bachelorSpecial"`
	Graduate        float64                   `json:"graduate"`
	Splits          []CurriculumSplitResponse `json:"splits"`
}

type resolvedCurriculumSplitInput struct {
	SplitGroupID uuid.UUID
	SplitGroup   models.SplitGroup
	PctSplit     float64
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

func normalizeCurriculumGroupName(value string) string {
	value = strings.TrimSpace(value)

	switch value {
	case "bachelor_normal", "bachelor normal", "normal", "ปกติ", "ตรีปกติ", "ป.ตรีปกติ", "ป.ตรี (ปกติ)":
		return CurriculumGroupBachelorNormalName

	case "bachelor_special", "bachelor special", "special", "พิเศษ", "ตรีพิเศษ", "ป.ตรีพิเศษ", "ป.ตรี (พิเศษ)":
		return CurriculumGroupBachelorSpecialName

	case "graduate", "grad", "บัณฑิต", "บัณฑิตศึกษา", "ป.โท", "ป.เอก":
		return CurriculumGroupGraduateName

	default:
		return value
	}
}

func validCurriculumGroupName(name string) bool {
	switch name {
	case CurriculumGroupBachelorNormalName, CurriculumGroupBachelorSpecialName, CurriculumGroupGraduateName:
		return true
	default:
		return false
	}
}

func (s *CurriculumService) findSplitGroupByID(id uuid.UUID) (*models.SplitGroup, error) {
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

func (s *CurriculumService) findSplitGroupByName(name string) (*models.SplitGroup, error) {
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

func (s *CurriculumService) resolveSplitGroup(input CurriculumSplitInput) (*models.SplitGroup, error) {
	splitGroupID := strings.TrimSpace(input.SplitGroupID)
	splitGroupName := normalizeCurriculumGroupName(input.SplitGroup)

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

		splitGroup.Name = normalizeCurriculumGroupName(splitGroup.Name)

		if !validCurriculumGroupName(splitGroup.Name) {
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

		splitGroup.Name = normalizeCurriculumGroupName(splitGroup.Name)

		if !validCurriculumGroupName(splitGroup.Name) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		return splitGroup, nil
	}

	if !validCurriculumGroupName(splitGroupName) {
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

func (s *CurriculumService) normalizeCurriculumSplits(inputs []CurriculumSplitInput) ([]resolvedCurriculumSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]resolvedCurriculumSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.PctSplit = roundCurriculum2(input.PctSplit)

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

		groupName := normalizeCurriculumGroupName(splitGroup.Name)

		if !validCurriculumGroupName(groupName) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		if seen[groupName] {
			return nil, errors.New("พบกลุ่มสัดส่วนซ้ำ")
		}

		seen[groupName] = true

		result = append(result, resolvedCurriculumSplitInput{
			SplitGroupID: splitGroup.ID,
			SplitGroup:   *splitGroup,
			PctSplit:     input.PctSplit,
		})
	}

	requiredGroups := []string{
		CurriculumGroupBachelorNormalName,
		CurriculumGroupBachelorSpecialName,
		CurriculumGroupGraduateName,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ป.ตรี (ปกติ), ป.ตรี (พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildCurriculumSplitModels(inputs []resolvedCurriculumSplitInput) []models.CurriculumSplit {
	result := make([]models.CurriculumSplit, 0, len(inputs))

	for _, input := range inputs {
		result = append(result, models.CurriculumSplit{
			SplitGroupID: input.SplitGroupID,
			PctSplit:     input.PctSplit,
		})
	}

	return result
}

func mapCurriculumSplitGroupResponse(item models.SplitGroup) CurriculumSplitGroupResponse {
	return CurriculumSplitGroupResponse{
		ID:          item.ID.String(),
		Name:        item.Name,
		Description: item.Description,
		Status:      item.Status,
	}
}

func mapCurriculumSplitResponse(split models.CurriculumSplit) CurriculumSplitResponse {
	return CurriculumSplitResponse{
		ID:           split.ID.String(),
		CurriculumID: split.CurriculumID.String(),
		SplitGroupID: split.SplitGroupID.String(),
		SplitGroup:   mapCurriculumSplitGroupResponse(split.SplitGroup),
		PctSplit:     split.PctSplit,
	}
}

func mapCurriculumResponse(item *models.Curriculum) CurriculumResponse {
	response := CurriculumResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
		Splits: make([]CurriculumSplitResponse, 0, len(item.Splits)),
	}

	for _, split := range item.Splits {
		response.Splits = append(response.Splits, mapCurriculumSplitResponse(split))

		groupName := normalizeCurriculumGroupName(split.SplitGroup.Name)

		switch groupName {
		case CurriculumGroupBachelorNormalName:
			response.BachelorNormal = split.PctSplit
		case CurriculumGroupBachelorSpecialName:
			response.BachelorSpecial = split.PctSplit
		case CurriculumGroupGraduateName:
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

	normalizedSplits, err := s.normalizeCurriculumSplits(input.Splits)
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

	normalizedSplits, err := s.normalizeCurriculumSplits(input.Splits)
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