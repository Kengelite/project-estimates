package service

import (
	"errors"
	"strings"
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"

	// "fmt"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(user *models.User) error {
    // 🔥 กัน space / newline จาก client
    password := strings.TrimSpace(user.Pwd)
    if password == "" {
        return errors.New("password is required")
    }

    // 🔐 hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }

    user.Pwd = string(hashedPassword)

    return repository.CreateUser(user)
}

func LoginUser(email, password string) (string, error) {
    // 🔥 normalize input
    email = strings.TrimSpace(email)
    password = strings.TrimSpace(password)

    if email == "" || password == "" {
        return "", errors.New("invalid email or password")
    }

    // 1. หา user
    user, err := repository.GetUserByEmail(email)
    if err != nil {
        return "", errors.New("invalid email or password")
    }

    // 🔥 debug แบบปลอดภัย (ไม่ print password จริง)
    // fmt.Printf("Login attempt: %s (pwd len: %d)\n", email, len(password))

    // 2. compare password
    err = bcrypt.CompareHashAndPassword([]byte(user.Pwd), []byte(password))
    if err != nil {
        return "", errors.New("invalid email or password")
    }

    // 3. generate token
    token, err := GenerateToken(user.ID, user.Role.Name)
    if err != nil {
        return "", err
    }

    return token, nil
}