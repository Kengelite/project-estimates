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

type CentralService struct {
	Repo *repository.CentralRepository
}

func NewCentralService(repo *repository.CentralRepository) *CentralService {
	return &CentralService{Repo: repo}
}

const (
	CentralGroupBachelorNormalName  = "ป.ตรี (ปกติ)"
	CentralGroupBachelorSpecialName = "ป.ตรี (พิเศษ)"
	CentralGroupGraduateName        = "บัณฑิต"
)

type CentralSplitInput struct {
	SplitGroupID string  `json:"splitGroupId"`
	SplitGroup   string  `json:"splitGroup"`
	PctSplit     float64 `json:"pctSplit"`
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

type SplitGroupCentralResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

type CentralSplitResponse struct {
	ID           string                    `json:"id"`
	CentralID    string                    `json:"centralId"`
	SplitGroupID string                    `json:"splitGroupId"`
	SplitGroup   SplitGroupCentralResponse `json:"splitGroup"`
	PctSplit     float64                   `json:"pctSplit"`
}

type CentralResponse struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Status          string                 `json:"status"`
	BachelorNormal  float64                `json:"bachelorNormal"`
	BachelorSpecial float64                `json:"bachelorSpecial"`
	Graduate        float64                `json:"graduate"`
	Splits          []CentralSplitResponse `json:"splits"`
}

type resolvedCentralSplitInput struct {
	SplitGroupID uuid.UUID
	SplitGroup   models.SplitGroup
	PctSplit     float64
}

func roundCentral2(v float64) float64 {
	return math.Round(v*100) / 100
}

func normalizeName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeStatus(value string) string {
	return strings.TrimSpace(value)
}

func normalizeCentralGroupName(value string) string {
	value = strings.TrimSpace(value)

	switch value {
	case "bachelor_normal", "bachelor normal", "normal", "ปกติ", "ตรีปกติ", "ป.ตรีปกติ", "ป.ตรี (ปกติ)":
		return CentralGroupBachelorNormalName

	case "bachelor_special", "bachelor special", "special", "พิเศษ", "ตรีพิเศษ", "ป.ตรีพิเศษ", "ป.ตรี (พิเศษ)":
		return CentralGroupBachelorSpecialName

	case "graduate", "grad", "บัณฑิต", "บัณฑิตศึกษา", "ป.โท", "ป.เอก":
		return CentralGroupGraduateName

	default:
		return value
	}
}

func validCentralGroupName(name string) bool {
	switch name {
	case CentralGroupBachelorNormalName, CentralGroupBachelorSpecialName, CentralGroupGraduateName:
		return true
	default:
		return false
	}
}

func (s *CentralService) findSplitGroupByID(id uuid.UUID) (*models.SplitGroup, error) {
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

func (s *CentralService) findSplitGroupByName(name string) (*models.SplitGroup, error) {
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

func (s *CentralService) resolveSplitGroup(input CentralSplitInput) (*models.SplitGroup, error) {
	splitGroupID := strings.TrimSpace(input.SplitGroupID)
	splitGroupName := normalizeCentralGroupName(input.SplitGroup)

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

		splitGroup.Name = normalizeCentralGroupName(splitGroup.Name)

		if !validCentralGroupName(splitGroup.Name) {
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

		splitGroup.Name = normalizeCentralGroupName(splitGroup.Name)

		if !validCentralGroupName(splitGroup.Name) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		return splitGroup, nil
	}

	if !validCentralGroupName(splitGroupName) {
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

func (s *CentralService) normalizeSplits(inputs []CentralSplitInput) ([]resolvedCentralSplitInput, error) {
	if len(inputs) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลเปอร์เซ็นต์อย่างน้อย 1 รายการ")
	}

	seen := map[string]bool{}
	result := make([]resolvedCentralSplitInput, 0, len(inputs))

	for _, input := range inputs {
		input.PctSplit = roundCentral2(input.PctSplit)

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

		groupName := normalizeCentralGroupName(splitGroup.Name)

		if !validCentralGroupName(groupName) {
			return nil, errors.New("พบกลุ่มสัดส่วนไม่ถูกต้อง")
		}

		if seen[groupName] {
			return nil, errors.New("พบกลุ่มสัดส่วนซ้ำ")
		}

		seen[groupName] = true

		result = append(result, resolvedCentralSplitInput{
			SplitGroupID: splitGroup.ID,
			SplitGroup:   *splitGroup,
			PctSplit:     input.PctSplit,
		})
	}

	requiredGroups := []string{
		CentralGroupBachelorNormalName,
		CentralGroupBachelorSpecialName,
		CentralGroupGraduateName,
	}

	for _, group := range requiredGroups {
		if !seen[group] {
			return nil, errors.New("ข้อมูลสัดส่วนไม่ครบ กรุณาระบุ ป.ตรี (ปกติ), ป.ตรี (พิเศษ) และบัณฑิต")
		}
	}

	return result, nil
}

func buildSplitModels(inputs []resolvedCentralSplitInput) []models.CentralSplit {
	result := make([]models.CentralSplit, 0, len(inputs))

	for _, input := range inputs {
		result = append(result, models.CentralSplit{
			SplitGroupID: input.SplitGroupID,
			PctSplit:     input.PctSplit,
		})
	}

	return result
}

func mapSplitGroupResponse(item models.SplitGroup) SplitGroupCentralResponse {
	return SplitGroupCentralResponse{
		ID:          item.ID.String(),
		Name:        item.Name,
		Description: item.Description,
		Status:      item.Status,
	}
}

func mapCentralSplitResponse(split models.CentralSplit) CentralSplitResponse {
	return CentralSplitResponse{
		ID:           split.ID.String(),
		CentralID:    split.CentralID.String(),
		SplitGroupID: split.SplitGroupID.String(),
		SplitGroup:   mapSplitGroupResponse(split.SplitGroup),
		PctSplit:     split.PctSplit,
	}
}

func mapCentralResponse(item *models.Central) CentralResponse {
	response := CentralResponse{
		ID:     item.ID.String(),
		Name:   item.Name,
		Status: item.Status,
		Splits: make([]CentralSplitResponse, 0, len(item.Splits)),
	}

	for _, split := range item.Splits {
		response.Splits = append(response.Splits, mapCentralSplitResponse(split))

		groupName := normalizeCentralGroupName(split.SplitGroup.Name)

		switch groupName {
		case CentralGroupBachelorNormalName:
			response.BachelorNormal = split.PctSplit
		case CentralGroupBachelorSpecialName:
			response.BachelorSpecial = split.PctSplit
		case CentralGroupGraduateName:
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

	normalizedSplits, err := s.normalizeSplits(input.Splits)
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

	normalizedSplits, err := s.normalizeSplits(input.Splits)
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
