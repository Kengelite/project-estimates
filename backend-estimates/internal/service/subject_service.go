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

type SubjectService struct {
	Repo *repository.SubjectRepository
}

func NewSubjectService(repo *repository.SubjectRepository) *SubjectService {
	return &SubjectService{Repo: repo}
}

type SubjectResponse struct {
	ID                 string  `json:"id"`
	SubjectCourseID    string  `json:"subjectCourseId"`
	CourseID           string  `json:"courseId"`
	CourseName         string  `json:"courseName"`
	YearID             int     `json:"yearId"`
	Year               string  `json:"year"`
	StudentYearID      int     `json:"studentYearId"`
	StudentYear        string  `json:"studentYear"`
	SemesterID         int     `json:"semesterId"`
	Semester           string  `json:"semester"`
	SubjectOutsideID   string  `json:"subjectOutsideId"`
	SubjectOutsideCode string  `json:"subjectOutsideCode"`
	SubjectOutsideName string  `json:"subjectOutsideName"`
	SubjectCode        string  `json:"subjectCode"`
	SubjectName        string  `json:"subjectName"`
	PricePerStudent    float64 `json:"pricePerStudent"`
	RegisteredCount    int     `json:"registeredCount"`
	TotalAmount        float64 `json:"totalAmount"`
	Status             string  `json:"status"`
}

type SubjectCourseResponse struct {
	ID              string  `json:"id"`
	CourseID        string  `json:"courseId"`
	CourseName      string  `json:"courseName"`
	PricePerStudent float64 `json:"pricePerStudent"`
	RegisteredCount int     `json:"registeredCount"`
	TotalAmount     float64 `json:"totalAmount"`
	Status          string  `json:"status"`
}

type SubjectDetailResponse struct {
	ID                 string                  `json:"id"`
	YearID             int                     `json:"yearId"`
	Year               string                  `json:"year"`
	StudentYearID      int                     `json:"studentYearId"`
	StudentYear        string                  `json:"studentYear"`
	SemesterID         int                     `json:"semesterId"`
	Semester           string                  `json:"semester"`
	SubjectOutsideID   string                  `json:"subjectOutsideId"`
	SubjectOutsideCode string                  `json:"subjectOutsideCode"`
	SubjectOutsideName string                  `json:"subjectOutsideName"`
	SubjectCode        string                  `json:"subjectCode"`
	SubjectName        string                  `json:"subjectName"`
	Status             string                  `json:"status"`
	SubjectCourses     []SubjectCourseResponse `json:"subjectCourses"`
}

type SubjectCourseInput struct {
	CourseID         string  `json:"courseId"`
	PricePerStudent float64 `json:"pricePerStudent"`
	RegisteredCount int     `json:"registeredCount"`
	Status          string  `json:"status"`
}

type CreateSubjectInput struct {
	YearID           int                  `json:"yearId"`
	StudentYearID    int                  `json:"studentYearId"`
	SemesterID        int                  `json:"semesterId"`
	SubjectOutsideID string               `json:"subjectOutsideId"`
	SubjectCode      string               `json:"subjectCode"`
	SubjectName      string               `json:"subjectName"`
	Status           string               `json:"status"`
	SubjectCourses   []SubjectCourseInput `json:"subjectCourses"`
}

type UpdateSubjectInput struct {
	YearID           int                  `json:"yearId"`
	StudentYearID    int                  `json:"studentYearId"`
	SemesterID        int                  `json:"semesterId"`
	SubjectOutsideID string               `json:"subjectOutsideId"`
	SubjectCode      string               `json:"subjectCode"`
	SubjectName      string               `json:"subjectName"`
	Status           string               `json:"status"`
	SubjectCourses   []SubjectCourseInput `json:"subjectCourses"`
}

type UpdateSubjectStatusInput struct {
	Status string `json:"status"`
}

func normalizeSubjectText(value string) string {
	return strings.TrimSpace(value)
}

func normalizeSubjectStatus(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return "1"
	}
	return value
}

func roundSubject2(v float64) float64 {
	return math.Round(v*100) / 100
}

func parseUUIDSubject(value string) uuid.UUID {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil
	}
	return id
}

func (s *SubjectService) mapSubjectListResponse(item *models.Subject, course *models.SubjectCourse) SubjectResponse {
	yearName := ""
	if item.Year.ID != 0 {
		yearName = item.Year.Year
	}

	studentYearName := ""
	if item.StudentYear.ID != 0 {
		studentYearName = item.StudentYear.StudentYear
	}

	semesterName := ""
	if item.Semester.ID != 0 {
		semesterName = item.Semester.Semester
	}

	subjectOutsideID := item.SubjectOutsideID
	subjectOutsideCode := ""
	subjectOutsideName := ""

	if item.SubjectOutside.ID != uuid.Nil {
		subjectOutsideID = item.SubjectOutside.ID.String()
		subjectOutsideCode = item.SubjectOutside.SubjectCode
		subjectOutsideName = item.SubjectOutside.SubjectName
	}

	courseID := ""
	courseName := ""
	subjectCourseID := ""
	pricePerStudent := 0.0
	registeredCount := 0
	status := item.Status

	if course != nil {
		subjectCourseID = course.ID.String()
		courseID = course.CourseID.String()
		courseName = course.Course.NameTH
		pricePerStudent = roundSubject2(course.PricePerStudent)
		registeredCount = course.RegisteredCount
		status = course.Status
	}

	return SubjectResponse{
		ID:                 item.ID.String(),
		SubjectCourseID:    subjectCourseID,
		CourseID:           courseID,
		CourseName:         courseName,
		YearID:             item.YearID,
		Year:               yearName,
		StudentYearID:      item.StudentYearID,
		StudentYear:        studentYearName,
		SemesterID:         item.SemesterID,
		Semester:           semesterName,
		SubjectOutsideID:   subjectOutsideID,
		SubjectOutsideCode: subjectOutsideCode,
		SubjectOutsideName: subjectOutsideName,
		SubjectCode:        item.SubjectCode,
		SubjectName:        item.SubjectName,
		PricePerStudent:    pricePerStudent,
		RegisteredCount:    registeredCount,
		TotalAmount:        roundSubject2(pricePerStudent * float64(registeredCount)),
		Status:             status,
	}
}

func (s *SubjectService) mapSubjectDetailResponse(item *models.Subject) SubjectDetailResponse {
	yearName := ""
	if item.Year.ID != 0 {
		yearName = item.Year.Year
	}

	studentYearName := ""
	if item.StudentYear.ID != 0 {
		studentYearName = item.StudentYear.StudentYear
	}

	semesterName := ""
	if item.Semester.ID != 0 {
		semesterName = item.Semester.Semester
	}

	subjectOutsideID := item.SubjectOutsideID
	subjectOutsideCode := ""
	subjectOutsideName := ""

	if item.SubjectOutside.ID != uuid.Nil {
		subjectOutsideID = item.SubjectOutside.ID.String()
		subjectOutsideCode = item.SubjectOutside.SubjectCode
		subjectOutsideName = item.SubjectOutside.SubjectName
	}

	resp := SubjectDetailResponse{
		ID:                 item.ID.String(),
		YearID:             item.YearID,
		Year:               yearName,
		StudentYearID:      item.StudentYearID,
		StudentYear:        studentYearName,
		SemesterID:         item.SemesterID,
		Semester:           semesterName,
		SubjectOutsideID:   subjectOutsideID,
		SubjectOutsideCode: subjectOutsideCode,
		SubjectOutsideName: subjectOutsideName,
		SubjectCode:        item.SubjectCode,
		SubjectName:        item.SubjectName,
		Status:             item.Status,
		SubjectCourses:     []SubjectCourseResponse{},
	}

	for _, course := range item.SubjectCourses {
		resp.SubjectCourses = append(resp.SubjectCourses, SubjectCourseResponse{
			ID:              course.ID.String(),
			CourseID:        course.CourseID.String(),
			CourseName:      course.Course.NameTH,
			PricePerStudent: roundSubject2(course.PricePerStudent),
			RegisteredCount: course.RegisteredCount,
			TotalAmount:     roundSubject2(course.PricePerStudent * float64(course.RegisteredCount)),
			Status:          course.Status,
		})
	}

	return resp
}

func buildSubjectCourseModels(inputCourses []SubjectCourseInput) ([]models.SubjectCourse, error) {
	result := make([]models.SubjectCourse, 0, len(inputCourses))
	seen := map[string]bool{}

	for _, row := range inputCourses {
		courseID := parseUUIDSubject(row.CourseID)
		if courseID == uuid.Nil {
			return nil, errors.New("รหัสหลักสูตรไม่ถูกต้อง")
		}

		if seen[courseID.String()] {
			return nil, errors.New("ห้ามเลือกหลักสูตรซ้ำ")
		}
		seen[courseID.String()] = true

		if row.PricePerStudent < 0 {
			return nil, errors.New("ราคาต่อคนต้องไม่น้อยกว่า 0")
		}

		if row.RegisteredCount < 0 {
			return nil, errors.New("จำนวนคนลงทะเบียนต้องไม่น้อยกว่า 0")
		}

		status := normalizeSubjectStatus(row.Status)
		if status != "0" && status != "1" {
			return nil, errors.New("status ของหลักสูตรต้องเป็น 0 หรือ 1")
		}

		result = append(result, models.SubjectCourse{
			CourseID:         courseID,
			PricePerStudent: roundSubject2(row.PricePerStudent),
			RegisteredCount: row.RegisteredCount,
			Status:           status,
		})
	}

	return result, nil
}

func (s *SubjectService) GetAll() ([]SubjectResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]SubjectResponse, 0)

	for i := range items {
		item := items[i]

		if len(item.SubjectCourses) == 0 {
			result = append(result, s.mapSubjectListResponse(&item, nil))
			continue
		}

		for j := range item.SubjectCourses {
			course := item.SubjectCourses[j]
			result = append(result, s.mapSubjectListResponse(&item, &course))
		}
	}

	return result, nil
}

func (s *SubjectService) GetByID(id string) (*SubjectDetailResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลรายวิชา")
		}
		return nil, err
	}

	resp := s.mapSubjectDetailResponse(item)
	return &resp, nil
}

func (s *SubjectService) validateSubjectOutsideID(subjectOutsideID string) error {
	subjectOutsideID = strings.TrimSpace(subjectOutsideID)

	if subjectOutsideID == "" {
		return errors.New("กรุณาเลือกวิชานอกคณะ")
	}

	if parseUUIDSubject(subjectOutsideID) == uuid.Nil {
		return errors.New("รหัสวิชานอกคณะไม่ถูกต้อง")
	}

	exists, err := s.Repo.ExistsSubjectOutsideByID(subjectOutsideID)
	if err != nil {
		return err
	}

	if !exists {
		return errors.New("ไม่พบข้อมูลวิชานอกคณะที่เลือก")
	}

	return nil
}

func (s *SubjectService) validateSubjectBasic(
	yearID int,
	studentYearID int,
	semesterID int,
	subjectOutsideID string,
	subjectCode string,
	subjectName string,
	status string,
) error {
	if yearID <= 0 {
		return errors.New("กรุณาเลือกปีการศึกษา")
	}

	if studentYearID <= 0 {
		return errors.New("กรุณาเลือกชั้นปี")
	}

	if semesterID <= 0 {
		return errors.New("กรุณาเลือกภาคการศึกษา")
	}

	if err := s.validateSubjectOutsideID(subjectOutsideID); err != nil {
		return err
	}

	if subjectCode == "" {
		return errors.New("กรุณากรอกรหัสวิชา")
	}

	if len(subjectCode) > 8 {
		return errors.New("รหัสวิชาต้องไม่เกิน 8 ตัวอักษร")
	}

	if subjectName == "" {
		return errors.New("กรุณากรอกชื่อวิชา")
	}

	if len(subjectName) > 255 {
		return errors.New("ชื่อวิชาต้องไม่เกิน 255 ตัวอักษร")
	}

	if status != "0" && status != "1" {
		return errors.New("status ต้องเป็น 0 หรือ 1")
	}

	return nil
}

func (s *SubjectService) Create(input CreateSubjectInput) (*SubjectDetailResponse, error) {
	input.SubjectOutsideID = strings.TrimSpace(input.SubjectOutsideID)
	input.SubjectCode = normalizeSubjectText(input.SubjectCode)
	input.SubjectName = normalizeSubjectText(input.SubjectName)
	input.Status = normalizeSubjectStatus(input.Status)

	if err := s.validateSubjectBasic(
		input.YearID,
		input.StudentYearID,
		input.SemesterID,
		input.SubjectOutsideID,
		input.SubjectCode,
		input.SubjectName,
		input.Status,
	); err != nil {
		return nil, err
	}

	if len(input.SubjectCourses) == 0 {
		return nil, errors.New("กรุณาเพิ่มหลักสูตรที่เปิดสอนอย่างน้อย 1 รายการ")
	}

	existing, err := s.Repo.FindDuplicate(
		input.YearID,
		input.StudentYearID,
		input.SemesterID,
		input.SubjectOutsideID,
		input.SubjectCode,
		input.SubjectName,
	)
	if err == nil && existing != nil {
		return nil, errors.New("มีรายวิชานี้อยู่แล้วในปีการศึกษา ภาคการศึกษา ชั้นปี และวิชานอกคณะนี้")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	subjectCourses, err := buildSubjectCourseModels(input.SubjectCourses)
	if err != nil {
		return nil, err
	}

	item := &models.Subject{
		YearID:           input.YearID,
		StudentYearID:    input.StudentYearID,
		SemesterID:        input.SemesterID,
		SubjectOutsideID: input.SubjectOutsideID,
		SubjectCode:      input.SubjectCode,
		SubjectName:      input.SubjectName,
		Status:           input.Status,
	}

	if err := s.Repo.CreateWithCourses(item, subjectCourses); err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := s.mapSubjectDetailResponse(created)
	return &resp, nil
}

func (s *SubjectService) Update(id string, input UpdateSubjectInput) (*SubjectDetailResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลรายวิชา")
		}
		return nil, err
	}

	input.SubjectOutsideID = strings.TrimSpace(input.SubjectOutsideID)
	input.SubjectCode = normalizeSubjectText(input.SubjectCode)
	input.SubjectName = normalizeSubjectText(input.SubjectName)
	input.Status = normalizeSubjectStatus(input.Status)

	if err := s.validateSubjectBasic(
		input.YearID,
		input.StudentYearID,
		input.SemesterID,
		input.SubjectOutsideID,
		input.SubjectCode,
		input.SubjectName,
		input.Status,
	); err != nil {
		return nil, err
	}

	if len(input.SubjectCourses) == 0 {
		return nil, errors.New("กรุณาเพิ่มหลักสูตรที่เปิดสอนอย่างน้อย 1 รายการ")
	}

	existing, err := s.Repo.FindDuplicate(
		input.YearID,
		input.StudentYearID,
		input.SemesterID,
		input.SubjectOutsideID,
		input.SubjectCode,
		input.SubjectName,
	)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("มีรายวิชานี้อยู่แล้วในปีการศึกษา ภาคการศึกษา ชั้นปี และวิชานอกคณะนี้")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	subjectCourses, err := buildSubjectCourseModels(input.SubjectCourses)
	if err != nil {
		return nil, err
	}

	item.YearID = input.YearID
	item.StudentYearID = input.StudentYearID
	item.SemesterID = input.SemesterID
	item.SubjectOutsideID = input.SubjectOutsideID
	item.SubjectCode = input.SubjectCode
	item.SubjectName = input.SubjectName
	item.Status = input.Status

	if err := s.Repo.UpdateWithCourses(item, subjectCourses); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := s.mapSubjectDetailResponse(updated)
	return &resp, nil
}

func (s *SubjectService) UpdateStatus(id string, input UpdateSubjectStatusInput) (*SubjectDetailResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลรายวิชา")
		}
		return nil, err
	}

	input.Status = normalizeSubjectStatus(input.Status)
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

	resp := s.mapSubjectDetailResponse(updated)
	return &resp, nil
}

func (s *SubjectService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลรายวิชา")
		}
		return err
	}

	return s.Repo.Delete(id)
}