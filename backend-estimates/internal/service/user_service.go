package service

import (
	"errors"
	"regexp"
	"strings"

	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	Repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

type CreateUserInput struct {
	Name     string `json:"name"`
	Fname    string `json:"fname"`
	Lname    string `json:"lname"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Pwd      string `json:"pwd"`
	RoleID   string `json:"roleId"`
}

type UpdateUserInput struct {
	Name     string `json:"name"`
	Fname    string `json:"fname"`
	Lname    string `json:"lname"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Pwd      string `json:"pwd"`
	RoleID   string `json:"roleId"`
}

func (s *UserService) GetAll() ([]models.User, error) {
	return s.Repo.GetAll()
}

func (s *UserService) GetByID(id string) (*models.User, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("ไม่พบรหัสผู้ใช้งาน")
	}

	return s.Repo.GetByID(id)
}

func (s *UserService) GetRoles() ([]models.Role, error) {
	return s.Repo.GetRoles()
}

func resolveName(name string, fname string, lname string) (string, string) {
	name = strings.TrimSpace(name)
	fname = strings.TrimSpace(fname)
	lname = strings.TrimSpace(lname)

	if fname != "" || lname != "" {
		return fname, lname
	}

	if name == "" {
		return "", ""
	}

	parts := strings.Fields(name)
	if len(parts) == 1 {
		return parts[0], ""
	}

	return parts[0], strings.Join(parts[1:], " ")
}

func resolvePassword(password string, pwd string) string {
	password = strings.TrimSpace(password)
	pwd = strings.TrimSpace(pwd)

	if password != "" {
		return password
	}

	return pwd
}

func validatePassword(password string, isRequired bool) error {
	password = strings.TrimSpace(password)

	if !isRequired && password == "" {
		return nil
	}

	if password == "" {
		return errors.New("กรุณากรอกรหัสผ่าน")
	}

	if len(password) < 8 {
		return errors.New("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
	}

	hasUppercase, _ := regexp.MatchString(`[A-Z]`, password)
	if !hasUppercase {
		return errors.New("รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวใหญ่อย่างน้อย 1 ตัว")
	}

	hasSpecialChar, _ := regexp.MatchString(`[!@#$%^&*()_\+\-=\[\]{};':"\\|,.<>\/?~]`, password)
	if !hasSpecialChar {
		return errors.New("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว")
	}

	return nil
}

func (s *UserService) Create(input CreateUserInput) (*models.User, error) {
	fname, lname := resolveName(input.Name, input.Fname, input.Lname)
	email := strings.TrimSpace(input.Email)
	password := resolvePassword(input.Password, input.Pwd)
	roleIDText := strings.TrimSpace(input.RoleID)

	if fname == "" {
		return nil, errors.New("กรุณากรอกชื่อผู้ใช้งาน")
	}

	if lname == "" {
		return nil, errors.New("กรุณากรอกนามสกุลผู้ใช้งาน")
	}

	if email == "" {
		return nil, errors.New("กรุณากรอกอีเมล")
	}

	if err := validatePassword(password, true); err != nil {
		return nil, err
	}

	if roleIDText == "" {
		return nil, errors.New("กรุณาเลือกบทบาท")
	}

	roleID, err := uuid.Parse(roleIDText)
	if err != nil {
		return nil, errors.New("รหัสบทบาทไม่ถูกต้อง")
	}

	if _, err := s.Repo.GetRoleByID(roleID.String()); err != nil {
		return nil, errors.New("ไม่พบบทบาทผู้ใช้งาน")
	}

	existing, err := s.Repo.GetByEmail(email)
	if err == nil && existing != nil {
		return nil, errors.New("อีเมลนี้ถูกใช้งานแล้ว")
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("เข้ารหัสรหัสผ่านไม่สำเร็จ")
	}

	item := models.User{
		Fname:  fname,
		Lname:  lname,
		Email:  email,
		Pwd:    string(hashedPassword),
		RoleID: roleID,
	}

	if err := s.Repo.Create(&item); err != nil {
		return nil, err
	}

	return s.Repo.GetByID(item.ID.String())
}

func (s *UserService) Update(id string, input UpdateUserInput) (*models.User, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("ไม่พบรหัสผู้ใช้งาน")
	}

	item, err := s.Repo.GetByID(id)
	if err != nil {
		return nil, errors.New("ไม่พบข้อมูลผู้ใช้งาน")
	}

	fname, lname := resolveName(input.Name, input.Fname, input.Lname)
	email := strings.TrimSpace(input.Email)
	password := resolvePassword(input.Password, input.Pwd)
	roleIDText := strings.TrimSpace(input.RoleID)

	if fname == "" {
		return nil, errors.New("กรุณากรอกชื่อผู้ใช้งาน")
	}

	if lname == "" {
		return nil, errors.New("กรุณากรอกนามสกุลผู้ใช้งาน")
	}

	if email == "" {
		return nil, errors.New("กรุณากรอกอีเมล")
	}

	if roleIDText == "" {
		return nil, errors.New("กรุณาเลือกบทบาท")
	}

	roleID, err := uuid.Parse(roleIDText)
	if err != nil {
		return nil, errors.New("รหัสบทบาทไม่ถูกต้อง")
	}

	if _, err := s.Repo.GetRoleByID(roleID.String()); err != nil {
		return nil, errors.New("ไม่พบบทบาทผู้ใช้งาน")
	}

	existing, err := s.Repo.GetByEmail(email)
	if err == nil && existing != nil && existing.ID != item.ID {
		return nil, errors.New("อีเมลนี้ถูกใช้งานแล้ว")
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	item.Fname = fname
	item.Lname = lname
	item.Email = email
	item.RoleID = roleID

	if password != "" {
		if err := validatePassword(password, false); err != nil {
			return nil, err
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("เข้ารหัสรหัสผ่านไม่สำเร็จ")
		}

		item.Pwd = string(hashedPassword)
	}

	if err := s.Repo.Update(item); err != nil {
		return nil, err
	}

	return s.Repo.GetByID(item.ID.String())
}

func (s *UserService) Delete(id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("ไม่พบรหัสผู้ใช้งาน")
	}

	if _, err := s.Repo.GetByID(id); err != nil {
		return errors.New("ไม่พบข้อมูลผู้ใช้งาน")
	}

	return s.Repo.Delete(id)
}