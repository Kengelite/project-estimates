package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
	"errors"
	"math"
	"sort"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseService struct {
	Repo            *repository.CourseRepository
	DegreeLevelRepo *repository.DegreeLevelRepository
}

func NewCourseService(
	repo *repository.CourseRepository,
	degreeLevelRepo *repository.DegreeLevelRepository,
) *CourseService {
	return &CourseService{
		Repo:            repo,
		DegreeLevelRepo: degreeLevelRepo,
	}
}

type uuidString string

type CreateCourseStructureInput struct {
	SubjectCategoryID string `json:"subjectCategoryId"`
	Credit            int    `json:"credit"`
}

type CreateSubjectOutsideDeductInput struct {
	SubjectOutsideID string  `json:"subjectOutsideId"`
	Amount           float64 `json:"amount"`
}

type CreateCourseStudentInput struct {
	YearID        int `json:"yearId"`
	StudentAmount int `json:"studentAmount"`
}

type CreateCourseInput struct {
	DegreeLevelID uuidString `json:"degreeLevelId"`
	NameTH        string     `json:"nameTh"`
	NameEN        string     `json:"nameEn"`
	ShortName     string     `json:"shortName"`
	StudyDuration int        `json:"studyDuration"`
	TuitionFees   float64    `json:"tuitionFees"`
	DeductToUni   float64    `json:"deductToUni"`
	Status        string     `json:"status"`

	Structures            []CreateCourseStructureInput      `json:"structures"`
	SubjectOutsideDeducts []CreateSubjectOutsideDeductInput `json:"subjectOutsideDeducts"`
	Students              []CreateCourseStudentInput        `json:"students"`
}

type UpdateCourseInput struct {
	DegreeLevelID uuidString `json:"degreeLevelId"`
	NameTH        string     `json:"nameTh"`
	NameEN        string     `json:"nameEn"`
	ShortName     string     `json:"shortName"`
	StudyDuration int        `json:"studyDuration"`
	TuitionFees   float64    `json:"tuitionFees"`
	DeductToUni   float64    `json:"deductToUni"`
	Status        string     `json:"status"`

	Structures            []CreateCourseStructureInput      `json:"structures"`
	SubjectOutsideDeducts []CreateSubjectOutsideDeductInput `json:"subjectOutsideDeducts"`
	Students              []CreateCourseStudentInput        `json:"students"`
}

type UpdateCourseStatusInput struct {
	Status string `json:"status"`
}

type SectionMiniResponse struct {
	ID          int    `json:"id"`
	SectionName string `json:"sectionName"`
}

type DegreeLevelMiniResponse struct {
	ID        string              `json:"id"`
	SectionID int                 `json:"sectionId"`
	Section   SectionMiniResponse `json:"section"`
	Name      string              `json:"name"`
	ShortName string              `json:"shortName"`
	Status    string              `json:"status"`
}

type CourseStudentResponse struct {
	ID            string `json:"id"`
	YearID        int    `json:"yearId"`
	Year          string `json:"year"`
	StudentAmount int    `json:"studentAmount"`
	Amount        int    `json:"amount"`
}

type CourseResponse struct {
	ID            string                  `json:"id"`
	DegreeLevelID string                  `json:"degreeLevelId"`
	DegreeLevel   DegreeLevelMiniResponse `json:"degreeLevel"`
	NameTH        string                  `json:"nameTh"`
	NameEN        string                  `json:"nameEn"`
	ShortName     string                  `json:"shortName"`
	StudyDuration int                     `json:"studyDuration"`
	TuitionFees   float64                 `json:"tuitionFees"`
	DeductToUni   float64                 `json:"deductToUni"`
	Status        string                  `json:"status"`
	Students      []CourseStudentResponse `json:"students"`
}

type CourseGroupResponse struct {
	DegreeLevelID   string           `json:"degreeLevelId"`
	DegreeLevelName string           `json:"degreeLevelName"`
	DegreeShortName string           `json:"degreeShortName"`
	SectionID       int              `json:"sectionId"`
	SectionName     string           `json:"sectionName"`
	Count           int              `json:"count"`
	Courses         []CourseResponse `json:"courses"`
}

type CourseStructureResponse struct {
	ID                  string `json:"id"`
	SubjectCategoryID   string `json:"subjectCategoryId"`
	SubjectCategoryName string `json:"subjectCategoryName"`
	Credit              int    `json:"credit"`
}

type SubjectOutsideDeductResponse struct {
	ID               string  `json:"id"`
	SubjectOutsideID string  `json:"subjectOutsideId"`
	SubjectCode      string  `json:"subjectCode"`
	SubjectName      string  `json:"subjectName"`
	Amount           float64 `json:"amount"`
}

type CourseDetailResponse struct {
	ID                    string                         `json:"id"`
	DegreeLevelID         string                         `json:"degreeLevelId"`
	DegreeLevelName       string                         `json:"degreeLevelName"`
	SectionName           string                         `json:"sectionName"`
	NameTH                string                         `json:"nameTh"`
	NameEN                string                         `json:"nameEn"`
	ShortName             string                         `json:"shortName"`
	StudyDuration         int                            `json:"studyDuration"`
	TuitionFees           float64                        `json:"tuitionFees"`
	DeductToUni           float64                        `json:"deductToUni"`
	Status                string                         `json:"status"`
	Structures            []CourseStructureResponse      `json:"structures"`
	SubjectOutsideDeducts []SubjectOutsideDeductResponse `json:"subjectOutsideDeducts"`
	Students              []CourseStudentResponse        `json:"students"`
}

func normalizeCourseName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeCourseStatus(value string) string {
	return strings.TrimSpace(value)
}

func normalizeShortName(value string) string {
	return strings.TrimSpace(value)
}

func normalizeNameEN(value string) string {
	return strings.TrimSpace(value)
}

func roundCourse2(v float64) float64 {
	return math.Round(v*100) / 100
}

func mapCourseStudentsResponse(students []models.CourseStudent) []CourseStudentResponse {
	result := make([]CourseStudentResponse, 0, len(students))

	for _, student := range students {
		yearName := ""
		if student.Year.ID != 0 {
			yearName = student.Year.Year
		}

		result = append(result, CourseStudentResponse{
			ID:            student.ID.String(),
			YearID:        student.YearID,
			Year:          yearName,
			StudentAmount: student.StudentAmount,
			Amount:        student.StudentAmount,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].YearID == result[j].YearID {
			return result[i].Year < result[j].Year
		}
		return result[i].YearID < result[j].YearID
	})

	return result
}

func mapCourseResponse(item *models.Course) CourseResponse {
	resp := CourseResponse{
		ID:            item.ID.String(),
		DegreeLevelID: item.DegreeLevelID.String(),
		NameTH:        item.NameTH,
		NameEN:        item.NameEN,
		ShortName:     item.ShortName,
		StudyDuration: item.StudyDuration,
		TuitionFees:   item.TuitionFees,
		DeductToUni:   item.DeductToUni,
		Status:        item.Status,
		Students:      mapCourseStudentsResponse(item.Students),
	}

	if item.DegreeLevel.ID != uuid.Nil {
		resp.DegreeLevel = DegreeLevelMiniResponse{
			ID:        item.DegreeLevel.ID.String(),
			SectionID: item.DegreeLevel.SectionID,
			Name:      item.DegreeLevel.Name,
			ShortName: item.DegreeLevel.ShortName,
			Status:    item.DegreeLevel.Status,
			Section: SectionMiniResponse{
				ID:          item.DegreeLevel.Section.ID,
				SectionName: item.DegreeLevel.Section.SectionName,
			},
		}
	}

	return resp
}

func mapCourseDetailResponse(item *models.Course) *CourseDetailResponse {
	resp := &CourseDetailResponse{
		ID:                    item.ID.String(),
		DegreeLevelID:         item.DegreeLevelID.String(),
		DegreeLevelName:       item.DegreeLevel.Name,
		SectionName:           item.DegreeLevel.Section.SectionName,
		NameTH:                item.NameTH,
		NameEN:                item.NameEN,
		ShortName:             item.ShortName,
		StudyDuration:         item.StudyDuration,
		TuitionFees:           item.TuitionFees,
		DeductToUni:           item.DeductToUni,
		Status:                item.Status,
		Structures:            []CourseStructureResponse{},
		SubjectOutsideDeducts: []SubjectOutsideDeductResponse{},
		Students:              mapCourseStudentsResponse(item.Students),
	}

	for _, structure := range item.Structures {
		resp.Structures = append(resp.Structures, CourseStructureResponse{
			ID:                  structure.ID.String(),
			SubjectCategoryID:   structure.SubjectCategoryID.String(),
			SubjectCategoryName: structure.SubjectCategory.Name,
			Credit:              structure.Credit,
		})
	}

	for _, deduct := range item.SubjectOutsideDeducts {
		resp.SubjectOutsideDeducts = append(resp.SubjectOutsideDeducts, SubjectOutsideDeductResponse{
			ID:               deduct.ID.String(),
			SubjectOutsideID: deduct.SubjectOutsideID.String(),
			SubjectCode:      deduct.SubjectOutside.SubjectCode,
			SubjectName:      deduct.SubjectOutside.SubjectName,
			Amount:           deduct.Amount,
		})
	}

	return resp
}

func (s *CourseService) getAllCourses() ([]models.Course, error) {
	var items []models.Course

	if err := s.Repo.DB.
		Preload("DegreeLevel").
		Preload("DegreeLevel.Section").
		Preload("Students", func(db *gorm.DB) *gorm.DB {
			return db.Where("deleted_at IS NULL").Order("year_id ASC")
		}).
		Preload("Students.Year").
		Where("deleted_at IS NULL").
		Order("created_at DESC").
		Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (s *CourseService) getByNameAndDegreeLevel(nameTH string, degreeLevelID string) (*models.Course, error) {
	var item models.Course

	if err := s.Repo.DB.
		Where("name_th = ?", nameTH).
		Where("degree_level_id = ?", degreeLevelID).
		Where("deleted_at IS NULL").
		First(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (s *CourseService) GetAll() ([]CourseResponse, error) {
	items, err := s.getAllCourses()
	if err != nil {
		return nil, err
	}

	result := make([]CourseResponse, 0, len(items))
	for i := range items {
		result = append(result, mapCourseResponse(&items[i]))
	}

	return result, nil
}

func (s *CourseService) GetGroupedByDegreeLevel() ([]CourseGroupResponse, error) {
	items, err := s.getAllCourses()
	if err != nil {
		return nil, err
	}

	groupMap := map[string]*CourseGroupResponse{}

	for i := range items {
		item := items[i]
		key := item.DegreeLevelID.String()

		if _, ok := groupMap[key]; !ok {
			groupMap[key] = &CourseGroupResponse{
				DegreeLevelID:   key,
				DegreeLevelName: item.DegreeLevel.Name,
				DegreeShortName: item.DegreeLevel.ShortName,
				SectionID:       item.DegreeLevel.SectionID,
				SectionName:     item.DegreeLevel.Section.SectionName,
				Count:           0,
				Courses:         []CourseResponse{},
			}
		}

		groupMap[key].Courses = append(groupMap[key].Courses, mapCourseResponse(&item))
		groupMap[key].Count++
	}

	result := make([]CourseGroupResponse, 0, len(groupMap))
	for _, group := range groupMap {
		result = append(result, *group)
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].SectionID == result[j].SectionID {
			return result[i].DegreeLevelName < result[j].DegreeLevelName
		}
		return result[i].SectionID < result[j].SectionID
	})

	return result, nil
}

func (s *CourseService) GetByID(id string) (*CourseDetailResponse, error) {
	item, err := s.Repo.GetByIDWithRelations(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return nil, err
	}

	return mapCourseDetailResponse(item), nil
}

func (s *CourseService) Create(input CreateCourseInput) (*CourseResponse, error) {
	degreeLevelID := strings.TrimSpace(string(input.DegreeLevelID))
	input.NameTH = normalizeCourseName(input.NameTH)
	input.NameEN = normalizeNameEN(input.NameEN)
	input.ShortName = normalizeShortName(input.ShortName)
	input.Status = normalizeCourseStatus(input.Status)
	input.TuitionFees = roundCourse2(input.TuitionFees)
	input.DeductToUni = roundCourse2(input.DeductToUni)

	if degreeLevelID == "" {
		return nil, errors.New("กรุณาเลือกระดับปริญญา")
	}
	if input.NameTH == "" {
		return nil, errors.New("กรุณากรอกชื่อหลักสูตรภาษาไทย")
	}
	if len(input.NameTH) > 500 {
		return nil, errors.New("ชื่อหลักสูตรภาษาไทยต้องไม่เกิน 500 ตัวอักษร")
	}
	if len(input.NameEN) > 500 {
		return nil, errors.New("ชื่อหลักสูตรภาษาอังกฤษต้องไม่เกิน 500 ตัวอักษร")
	}
	if len(input.ShortName) > 10 {
		return nil, errors.New("ชื่อย่อต้องไม่เกิน 10 ตัวอักษร")
	}
	if input.StudyDuration < 0 {
		return nil, errors.New("ระยะเวลาศึกษาต้องไม่น้อยกว่า 0")
	}
	if input.TuitionFees < 0 {
		return nil, errors.New("ค่าเล่าเรียนต้องไม่น้อยกว่า 0")
	}
	if input.DeductToUni < 0 {
		return nil, errors.New("หักเข้ามหาวิทยาลัยต้องไม่น้อยกว่า 0")
	}
	if input.Status == "" {
		input.Status = "1"
	}
	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	degreeLevel, err := s.DegreeLevelRepo.GetByID(degreeLevelID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลระดับปริญญา")
		}
		return nil, err
	}

	existing, err := s.getByNameAndDegreeLevel(input.NameTH, degreeLevelID)
	if err == nil && existing != nil {
		return nil, errors.New("ชื่อหลักสูตรนี้มีอยู่แล้วในระดับปริญญานี้")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	for _, st := range input.Structures {
		if strings.TrimSpace(st.SubjectCategoryID) == "" {
			return nil, errors.New("กรุณาเลือกหมวดวิชาให้ครบ")
		}
		if st.Credit < 0 {
			return nil, errors.New("จำนวนหน่วยกิตต้องไม่น้อยกว่า 0")
		}
	}

	for _, od := range input.SubjectOutsideDeducts {
		if strings.TrimSpace(od.SubjectOutsideID) == "" {
			return nil, errors.New("กรุณาเลือกรายวิชานอกคณะให้ครบ")
		}
		if od.Amount < 0 {
			return nil, errors.New("จำนวนเงินรายวิชานอกคณะต้องไม่น้อยกว่า 0")
		}
	}

	for _, student := range input.Students {
		if student.YearID <= 0 {
			return nil, errors.New("กรุณาเลือกปีการศึกษาให้ครบ")
		}
		if student.StudentAmount < 0 {
			return nil, errors.New("จำนวนนักศึกษาต้องไม่น้อยกว่า 0")
		}
	}

	tx := s.Repo.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	item := &models.Course{
		DegreeLevelID: degreeLevel.ID,
		NameTH:        input.NameTH,
		NameEN:        input.NameEN,
		ShortName:     input.ShortName,
		StudyDuration: input.StudyDuration,
		TuitionFees:   input.TuitionFees,
		DeductToUni:   input.DeductToUni,
		Status:        input.Status,
	}

	if err := tx.Create(item).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, st := range input.Structures {
		subjectCategoryUUID, err := uuid.Parse(strings.TrimSpace(st.SubjectCategoryID))
		if err != nil {
			tx.Rollback()
			return nil, errors.New("รหัสหมวดวิชาไม่ถูกต้อง")
		}

		row := models.CourseStructure{
			CourseID:          item.ID,
			SubjectCategoryID: subjectCategoryUUID,
			Credit:            st.Credit,
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	for _, od := range input.SubjectOutsideDeducts {
		subjectOutsideUUID, err := uuid.Parse(strings.TrimSpace(od.SubjectOutsideID))
		if err != nil {
			tx.Rollback()
			return nil, errors.New("รหัสรายวิชานอกคณะไม่ถูกต้อง")
		}

		row := models.SubjectOutsideDeduct{
			CourseID:         item.ID,
			SubjectOutsideID: subjectOutsideUUID,
			Amount:           roundCourse2(od.Amount),
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	for _, student := range input.Students {
		row := models.CourseStudent{
			CourseID:      item.ID,
			YearID:        student.YearID,
			StudentAmount: student.StudentAmount,
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	created, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCourseResponse(created)
	return &resp, nil
}

func (s *CourseService) Update(id string, input UpdateCourseInput) (*CourseResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return nil, err
	}

	degreeLevelID := strings.TrimSpace(string(input.DegreeLevelID))
	input.NameTH = normalizeCourseName(input.NameTH)
	input.NameEN = normalizeNameEN(input.NameEN)
	input.ShortName = normalizeShortName(input.ShortName)
	input.Status = normalizeCourseStatus(input.Status)
	input.TuitionFees = roundCourse2(input.TuitionFees)
	input.DeductToUni = roundCourse2(input.DeductToUni)

	if degreeLevelID == "" {
		return nil, errors.New("กรุณาเลือกระดับปริญญา")
	}
	if input.NameTH == "" {
		return nil, errors.New("กรุณากรอกชื่อหลักสูตรภาษาไทย")
	}
	if len(input.NameTH) > 500 {
		return nil, errors.New("ชื่อหลักสูตรภาษาไทยต้องไม่เกิน 500 ตัวอักษร")
	}
	if len(input.NameEN) > 500 {
		return nil, errors.New("ชื่อหลักสูตรภาษาอังกฤษต้องไม่เกิน 500 ตัวอักษร")
	}
	if len(input.ShortName) > 10 {
		return nil, errors.New("ชื่อย่อต้องไม่เกิน 10 ตัวอักษร")
	}
	if input.StudyDuration < 0 {
		return nil, errors.New("ระยะเวลาศึกษาต้องไม่น้อยกว่า 0")
	}
	if input.TuitionFees < 0 {
		return nil, errors.New("ค่าเล่าเรียนต้องไม่น้อยกว่า 0")
	}
	if input.DeductToUni < 0 {
		return nil, errors.New("หักเข้ามหาวิทยาลัยต้องไม่น้อยกว่า 0")
	}
	if input.Status == "" {
		input.Status = item.Status
	}
	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	degreeLevel, err := s.DegreeLevelRepo.GetByID(degreeLevelID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลระดับปริญญา")
		}
		return nil, err
	}

	existing, err := s.getByNameAndDegreeLevel(input.NameTH, degreeLevelID)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("ชื่อหลักสูตรนี้มีอยู่แล้วในระดับปริญญานี้")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	for _, st := range input.Structures {
		if strings.TrimSpace(st.SubjectCategoryID) == "" {
			return nil, errors.New("กรุณาเลือกหมวดวิชาให้ครบ")
		}
		if st.Credit < 0 {
			return nil, errors.New("จำนวนหน่วยกิตต้องไม่น้อยกว่า 0")
		}
	}

	for _, od := range input.SubjectOutsideDeducts {
		if strings.TrimSpace(od.SubjectOutsideID) == "" {
			return nil, errors.New("กรุณาเลือกรายวิชานอกคณะให้ครบ")
		}
		if od.Amount < 0 {
			return nil, errors.New("จำนวนเงินรายวิชานอกคณะต้องไม่น้อยกว่า 0")
		}
	}

	for _, student := range input.Students {
		if student.YearID <= 0 {
			return nil, errors.New("กรุณาเลือกปีการศึกษาให้ครบ")
		}
		if student.StudentAmount < 0 {
			return nil, errors.New("จำนวนนักศึกษาต้องไม่น้อยกว่า 0")
		}
	}

	tx := s.Repo.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	item.DegreeLevelID = degreeLevel.ID
	item.NameTH = input.NameTH
	item.NameEN = input.NameEN
	item.ShortName = input.ShortName
	item.StudyDuration = input.StudyDuration
	item.TuitionFees = input.TuitionFees
	item.DeductToUni = input.DeductToUni
	item.Status = input.Status

	if err := tx.Save(item).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Where("course_id = ?", item.ID).Delete(&models.CourseStructure{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Where("course_id = ?", item.ID).Delete(&models.SubjectOutsideDeduct{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Where("course_id = ?", item.ID).Delete(&models.CourseStudent{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, st := range input.Structures {
		subjectCategoryUUID, err := uuid.Parse(strings.TrimSpace(st.SubjectCategoryID))
		if err != nil {
			tx.Rollback()
			return nil, errors.New("รหัสหมวดวิชาไม่ถูกต้อง")
		}

		row := models.CourseStructure{
			CourseID:          item.ID,
			SubjectCategoryID: subjectCategoryUUID,
			Credit:            st.Credit,
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	for _, od := range input.SubjectOutsideDeducts {
		subjectOutsideUUID, err := uuid.Parse(strings.TrimSpace(od.SubjectOutsideID))
		if err != nil {
			tx.Rollback()
			return nil, errors.New("รหัสรายวิชานอกคณะไม่ถูกต้อง")
		}

		row := models.SubjectOutsideDeduct{
			CourseID:         item.ID,
			SubjectOutsideID: subjectOutsideUUID,
			Amount:           roundCourse2(od.Amount),
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	for _, student := range input.Students {
		row := models.CourseStudent{
			CourseID:      item.ID,
			YearID:        student.YearID,
			StudentAmount: student.StudentAmount,
		}

		if err := tx.Create(&row).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCourseResponse(updated)
	return &resp, nil
}

func (s *CourseService) UpdateStatus(id string, input UpdateCourseStatusInput) (*CourseResponse, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return nil, err
	}

	input.Status = normalizeCourseStatus(input.Status)
	if input.Status != "0" && input.Status != "1" {
		return nil, errors.New("status ต้องเป็น 0 หรือ 1")
	}

	if err := s.Repo.UpdateStatus(id, input.Status); err != nil {
		return nil, err
	}

	updated, err := s.Repo.GetByID(item.ID.String())
	if err != nil {
		return nil, err
	}

	resp := mapCourseResponse(updated)
	return &resp, nil
}

func (s *CourseService) Delete(id string) error {
	_, err := s.Repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("ไม่พบข้อมูลหลักสูตร")
		}
		return err
	}

	return s.Repo.Delete(id)
}