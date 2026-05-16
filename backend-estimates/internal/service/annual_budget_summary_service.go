package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnnualBudgetSummaryService struct {
	Repo *repository.AnnualBudgetSummaryRepository
}

func NewAnnualBudgetSummaryService(repo *repository.AnnualBudgetSummaryRepository) *AnnualBudgetSummaryService {
	return &AnnualBudgetSummaryService{Repo: repo}
}

type CreateAnnualBudgetSummaryInput struct {
	YearID      string  `json:"yearId"`
	SummaryType string  `json:"summaryType"`
	SemesterID  *string `json:"semesterId"`

	TotalUniversityWorkAmount float64 `json:"totalUniversityWorkAmount"`
	TotalCurriculumAmount     float64 `json:"totalCurriculumAmount"`

	Status      string                            `json:"status"`
	CreatedByID *string                          `json:"createdById"`
	Courses     []AnnualBudgetSummaryCourseInput `json:"courses"`
}

type AnnualBudgetSummaryCourseInput struct {
	CourseID *string `json:"courseId"`

	CourseNameSnapshot      string `json:"courseNameSnapshot"`
	CourseShortNameSnapshot string `json:"courseShortNameSnapshot"`
	SectionTitleSnapshot    string `json:"sectionTitleSnapshot"`

	InitialAmount float64 `json:"initialAmount"`

	Step2DeductAmount    float64 `json:"step2DeductAmount"`
	Step2RemainingAmount float64 `json:"step2RemainingAmount"`

	Step3DeductAmount    float64 `json:"step3DeductAmount"`
	Step3RemainingAmount float64 `json:"step3RemainingAmount"`

	Step4DeductAmount    float64 `json:"step4DeductAmount"`
	Step4RemainingAmount float64 `json:"step4RemainingAmount"`

	Step5DeductAmount    float64 `json:"step5DeductAmount"`
	Step5RemainingAmount float64 `json:"step5RemainingAmount"`

	Step6DeductAmount    float64 `json:"step6DeductAmount"`
	FinalRemainingAmount float64 `json:"finalRemainingAmount"`

	Details []AnnualBudgetSummaryDetailInput `json:"details"`
}

type AnnualBudgetSummaryDetailInput struct {
	Step         string  `json:"step"`
	RefType      string  `json:"refType"`
	RefID        *string `json:"refId"`
	NameSnapshot string  `json:"nameSnapshot"`
	Percent      float64 `json:"percent"`
	DeductAmount float64 `json:"deductAmount"`
}

type UpdateAnnualBudgetSummaryStatusInput struct {
	Status string `json:"status"`
}

type AnnualBudgetSummaryYearResponse struct {
	ID   string `json:"id"`
	Year string `json:"year"`
}

type AnnualBudgetSummarySemesterResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Semester string `json:"semester"`
}

type AnnualBudgetSummaryResponse struct {
	ID                        string                              `json:"id"`
	YearID                    string                              `json:"yearId"`
	Year                      *AnnualBudgetSummaryYearResponse    `json:"year,omitempty"`
	SummaryType               string                              `json:"summaryType"`
	SemesterID                *string                             `json:"semesterId,omitempty"`
	Semester                  *AnnualBudgetSummarySemesterResponse `json:"semester,omitempty"`
	TotalUniversityWorkAmount float64                             `json:"totalUniversityWorkAmount"`
	TotalCurriculumAmount     float64                             `json:"totalCurriculumAmount"`
	Status                    string                              `json:"status"`
	Courses                   []AnnualBudgetSummaryCourseResponse `json:"courses"`
	CreatedAt                 string                              `json:"created_at"`
	UpdatedAt                 string                              `json:"updated_at"`
}

type AnnualBudgetSummaryCourseResponse struct {
	ID                      string                              `json:"id"`
	SummaryID               string                              `json:"summaryId"`
	CourseID                *string                             `json:"courseId,omitempty"`
	CourseNameSnapshot      string                              `json:"courseNameSnapshot"`
	CourseShortNameSnapshot string                              `json:"courseShortNameSnapshot"`
	SectionTitleSnapshot    string                              `json:"sectionTitleSnapshot"`
	InitialAmount           float64                             `json:"initialAmount"`
	Step2DeductAmount       float64                             `json:"step2DeductAmount"`
	Step2RemainingAmount    float64                             `json:"step2RemainingAmount"`
	Step3DeductAmount       float64                             `json:"step3DeductAmount"`
	Step3RemainingAmount    float64                             `json:"step3RemainingAmount"`
	Step4DeductAmount       float64                             `json:"step4DeductAmount"`
	Step4RemainingAmount    float64                             `json:"step4RemainingAmount"`
	Step5DeductAmount       float64                             `json:"step5DeductAmount"`
	Step5RemainingAmount    float64                             `json:"step5RemainingAmount"`
	Step6DeductAmount       float64                             `json:"step6DeductAmount"`
	FinalRemainingAmount    float64                             `json:"finalRemainingAmount"`
	Details                 []AnnualBudgetSummaryDetailResponse `json:"details"`
	CreatedAt               string                              `json:"created_at"`
	UpdatedAt               string                              `json:"updated_at"`
}

type AnnualBudgetSummaryDetailResponse struct {
	ID              string  `json:"id"`
	SummaryCourseID string  `json:"summaryCourseId"`
	Step            string  `json:"step"`
	RefType         string  `json:"refType"`
	RefID           *string `json:"refId,omitempty"`
	NameSnapshot    string  `json:"nameSnapshot"`
	Percent         float64 `json:"percent"`
	DeductAmount    float64 `json:"deductAmount"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

func roundBudget2(value float64) float64 {
	return math.Round(value*100) / 100
}

func parseRequiredUint(value string, fieldName string) (uint, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return 0, errors.New("กรุณาระบุ " + fieldName)
	}

	number, err := strconv.ParseUint(trimmed, 10, 64)
	if err != nil || number == 0 {
		return 0, errors.New(fieldName + " ไม่ถูกต้อง")
	}

	return uint(number), nil
}

func parseOptionalUint(value *string, fieldName string) (*uint, error) {
	if value == nil {
		return nil, nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil, nil
	}

	number, err := strconv.ParseUint(trimmed, 10, 64)
	if err != nil || number == 0 {
		return nil, errors.New(fieldName + " ไม่ถูกต้อง")
	}

	result := uint(number)
	return &result, nil
}

func parseOptionalUUID(value *string, fieldName string) (*uuid.UUID, error) {
	if value == nil {
		return nil, nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil, nil
	}

	id, err := uuid.Parse(trimmed)
	if err != nil {
		return nil, errors.New(fieldName + " ไม่ถูกต้อง")
	}

	return &id, nil
}

func formatTime(value time.Time) string {
	if value.IsZero() {
		return ""
	}

	return value.Format(time.RFC3339)
}

func validateSummaryType(value string) error {
	if value != "yearly" && value != "semester" {
		return errors.New("summaryType ต้องเป็น yearly หรือ semester")
	}

	return nil
}

func validateStatus(value string) error {
	if value != "0" && value != "1" {
		return errors.New("status ต้องเป็น 0 หรือ 1")
	}

	return nil
}

func validateDetailStep(value string) error {
	switch value {
	case "step4", "step5", "step6":
		return nil
	default:
		return errors.New("step ของรายละเอียดไม่ถูกต้อง")
	}
}

func validateRefType(value string) error {
	switch value {
	case "fund", "central", "university_work":
		return nil
	default:
		return errors.New("refType ของรายละเอียดไม่ถูกต้อง")
	}
}

func mapSummaryResponse(item *models.AnnualBudgetSummary) AnnualBudgetSummaryResponse {
	var semesterID *string
	if item.SemesterID != nil {
		value := strconv.FormatUint(uint64(*item.SemesterID), 10)
		semesterID = &value
	}

	var yearResponse *AnnualBudgetSummaryYearResponse
	if item.Year.ID != 0 {
		yearResponse = &AnnualBudgetSummaryYearResponse{
			ID:   strconv.FormatUint(uint64(item.Year.ID), 10),
			Year: item.Year.Year,
		}
	}

	var semesterResponse *AnnualBudgetSummarySemesterResponse
	if item.Semester != nil && item.Semester.ID != 0 {
		semesterResponse = &AnnualBudgetSummarySemesterResponse{
			ID:       strconv.FormatUint(uint64(item.Semester.ID), 10),
			Semester: item.Semester.Semester,
		}
	}

	response := AnnualBudgetSummaryResponse{
		ID:                        item.ID.String(),
		YearID:                    strconv.FormatUint(uint64(item.YearID), 10),
		Year:                      yearResponse,
		SummaryType:               item.SummaryType,
		SemesterID:                semesterID,
		Semester:                  semesterResponse,
		TotalUniversityWorkAmount: item.TotalUniversityWorkAmount,
		TotalCurriculumAmount:     item.TotalCurriculumAmount,
		Status:                    item.Status,
		Courses:                   make([]AnnualBudgetSummaryCourseResponse, 0, len(item.Courses)),
		CreatedAt:                 formatTime(item.CreatedAt),
		UpdatedAt:                 formatTime(item.UpdatedAt),
	}

	for _, course := range item.Courses {
		var courseID *string
		if course.CourseID != nil {
			value := course.CourseID.String()
			courseID = &value
		}

		courseResponse := AnnualBudgetSummaryCourseResponse{
			ID:                      course.ID.String(),
			SummaryID:               course.SummaryID.String(),
			CourseID:                courseID,
			CourseNameSnapshot:      course.CourseNameSnapshot,
			CourseShortNameSnapshot: course.CourseShortNameSnapshot,
			SectionTitleSnapshot:    course.SectionTitleSnapshot,
			InitialAmount:           course.InitialAmount,
			Step2DeductAmount:       course.Step2DeductAmount,
			Step2RemainingAmount:    course.Step2RemainingAmount,
			Step3DeductAmount:       course.Step3DeductAmount,
			Step3RemainingAmount:    course.Step3RemainingAmount,
			Step4DeductAmount:       course.Step4DeductAmount,
			Step4RemainingAmount:    course.Step4RemainingAmount,
			Step5DeductAmount:       course.Step5DeductAmount,
			Step5RemainingAmount:    course.Step5RemainingAmount,
			Step6DeductAmount:       course.Step6DeductAmount,
			FinalRemainingAmount:    course.FinalRemainingAmount,
			Details:                 make([]AnnualBudgetSummaryDetailResponse, 0, len(course.Details)),
			CreatedAt:               formatTime(course.CreatedAt),
			UpdatedAt:               formatTime(course.UpdatedAt),
		}

		for _, detail := range course.Details {
			var refID *string
			if detail.RefID != nil {
				value := detail.RefID.String()
				refID = &value
			}

			courseResponse.Details = append(courseResponse.Details, AnnualBudgetSummaryDetailResponse{
				ID:              detail.ID.String(),
				SummaryCourseID: detail.SummaryCourseID.String(),
				Step:            detail.Step,
				RefType:         detail.RefType,
				RefID:           refID,
				NameSnapshot:    detail.NameSnapshot,
				Percent:         detail.Percent,
				DeductAmount:    detail.DeductAmount,
				CreatedAt:       formatTime(detail.CreatedAt),
				UpdatedAt:       formatTime(detail.UpdatedAt),
			})
		}

		response.Courses = append(response.Courses, courseResponse)
	}

	return response
}

func (s *AnnualBudgetSummaryService) Create(input CreateAnnualBudgetSummaryInput) (*AnnualBudgetSummaryResponse, error) {
	yearID, err := parseRequiredUint(input.YearID, "yearId")
	if err != nil {
		return nil, err
	}

	input.SummaryType = strings.TrimSpace(input.SummaryType)
	if err := validateSummaryType(input.SummaryType); err != nil {
		return nil, err
	}

	semesterID, err := parseOptionalUint(input.SemesterID, "semesterId")
	if err != nil {
		return nil, err
	}

	if input.SummaryType == "semester" && semesterID == nil {
		return nil, errors.New("กรุณาระบุ semesterId")
	}

	createdByID, err := parseOptionalUUID(input.CreatedByID, "createdById")
	if err != nil {
		return nil, err
	}

	input.Status = strings.TrimSpace(input.Status)
	if input.Status == "" {
		input.Status = "1"
	}

	if err := validateStatus(input.Status); err != nil {
		return nil, err
	}

	if len(input.Courses) == 0 {
		return nil, errors.New("กรุณาระบุข้อมูลหลักสูตรอย่างน้อย 1 รายการ")
	}

	summary := &models.AnnualBudgetSummary{
		YearID:                    yearID,
		SummaryType:               input.SummaryType,
		SemesterID:                semesterID,
		TotalUniversityWorkAmount: roundBudget2(input.TotalUniversityWorkAmount),
		TotalCurriculumAmount:     roundBudget2(input.TotalCurriculumAmount),
		Status:                    input.Status,
		CreatedByID:               createdByID,
	}

	courses := make([]models.AnnualBudgetSummaryCourse, 0, len(input.Courses))
	detailsByCourseIndex := map[int][]models.AnnualBudgetSummaryDetail{}

	for i, courseInput := range input.Courses {
		courseInput.CourseNameSnapshot = strings.TrimSpace(courseInput.CourseNameSnapshot)
		courseInput.CourseShortNameSnapshot = strings.TrimSpace(courseInput.CourseShortNameSnapshot)
		courseInput.SectionTitleSnapshot = strings.TrimSpace(courseInput.SectionTitleSnapshot)

		if courseInput.CourseNameSnapshot == "" {
			return nil, errors.New("กรุณาระบุชื่อหลักสูตร")
		}

		if courseInput.CourseShortNameSnapshot == "" {
			courseInput.CourseShortNameSnapshot = "-"
		}

		if courseInput.SectionTitleSnapshot == "" {
			courseInput.SectionTitleSnapshot = "-"
		}

		courseID, err := parseOptionalUUID(courseInput.CourseID, "courseId")
		if err != nil {
			return nil, err
		}

		courses = append(courses, models.AnnualBudgetSummaryCourse{
			CourseID:                courseID,
			CourseNameSnapshot:      courseInput.CourseNameSnapshot,
			CourseShortNameSnapshot: courseInput.CourseShortNameSnapshot,
			SectionTitleSnapshot:    courseInput.SectionTitleSnapshot,

			InitialAmount: roundBudget2(courseInput.InitialAmount),

			Step2DeductAmount:    roundBudget2(courseInput.Step2DeductAmount),
			Step2RemainingAmount: roundBudget2(courseInput.Step2RemainingAmount),

			Step3DeductAmount:    roundBudget2(courseInput.Step3DeductAmount),
			Step3RemainingAmount: roundBudget2(courseInput.Step3RemainingAmount),

			Step4DeductAmount:    roundBudget2(courseInput.Step4DeductAmount),
			Step4RemainingAmount: roundBudget2(courseInput.Step4RemainingAmount),

			Step5DeductAmount:    roundBudget2(courseInput.Step5DeductAmount),
			Step5RemainingAmount: roundBudget2(courseInput.Step5RemainingAmount),

			Step6DeductAmount:    roundBudget2(courseInput.Step6DeductAmount),
			FinalRemainingAmount: roundBudget2(courseInput.FinalRemainingAmount),
		})

		details := make([]models.AnnualBudgetSummaryDetail, 0, len(courseInput.Details))

		for _, detailInput := range courseInput.Details {
			detailInput.Step = strings.TrimSpace(detailInput.Step)
			detailInput.RefType = strings.TrimSpace(detailInput.RefType)
			detailInput.NameSnapshot = strings.TrimSpace(detailInput.NameSnapshot)

			if err := validateDetailStep(detailInput.Step); err != nil {
				return nil, err
			}

			if err := validateRefType(detailInput.RefType); err != nil {
				return nil, err
			}

			if detailInput.NameSnapshot == "" {
				return nil, errors.New("กรุณาระบุชื่อรายการย่อย")
			}

			refID, err := parseOptionalUUID(detailInput.RefID, "refId")
			if err != nil {
				return nil, err
			}

			details = append(details, models.AnnualBudgetSummaryDetail{
				Step:         detailInput.Step,
				RefType:      detailInput.RefType,
				RefID:        refID,
				NameSnapshot: detailInput.NameSnapshot,
				Percent:      roundBudget2(detailInput.Percent),
				DeductAmount: roundBudget2(detailInput.DeductAmount),
			})
		}

		detailsByCourseIndex[i] = details
	}

	if err := s.Repo.Create(summary, courses, detailsByCourseIndex); err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(summary.ID.String())
	if err != nil {
		return nil, err
	}

	response := mapSummaryResponse(created)
	return &response, nil
}

func (s *AnnualBudgetSummaryService) GetAll() ([]AnnualBudgetSummaryResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]AnnualBudgetSummaryResponse, 0, len(items))
	for i := range items {
		result = append(result, mapSummaryResponse(&items[i]))
	}

	return result, nil
}

func (s *AnnualBudgetSummaryService) GetByID(id string) (*AnnualBudgetSummaryResponse, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, errors.New("กรุณาระบุ id")
	}

	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลสรุปงบประมาณ")
		}
		return nil, err
	}

	response := mapSummaryResponse(item)
	return &response, nil
}

func (s *AnnualBudgetSummaryService) UpdateStatus(id string, input UpdateAnnualBudgetSummaryStatusInput) (*AnnualBudgetSummaryResponse, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, errors.New("กรุณาระบุ id")
	}

	input.Status = strings.TrimSpace(input.Status)
	if err := validateStatus(input.Status); err != nil {
		return nil, err
	}

	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลสรุปงบประมาณ")
		}
		return nil, err
	}

	if err := s.Repo.UpdateStatus(id, input.Status); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	response := mapSummaryResponse(updated)
	return &response, nil
}

func (s *AnnualBudgetSummaryService) Delete(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("กรุณาระบุ id")
	}

	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลสรุปงบประมาณ")
		}
		return err
	}

	return s.Repo.Delete(id)
}