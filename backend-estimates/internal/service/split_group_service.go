package service

import (
	"backend-estimates/internal/models"
	"backend-estimates/internal/repository"
)

type SplitGroupService struct {
	Repo *repository.SplitGroupRepository
}

func NewSplitGroupService(repo *repository.SplitGroupRepository) *SplitGroupService {
	return &SplitGroupService{Repo: repo}
}

type SplitGroupResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

func mapSplitGroupToResponse(item models.SplitGroup) SplitGroupResponse {
	return SplitGroupResponse{
		ID:          item.ID.String(),
		Name:        item.Name,
		Description: item.Description,
		Status:      item.Status,
	}
}

func (s *SplitGroupService) GetAll() ([]SplitGroupResponse, error) {
	items, err := s.Repo.GetAll()
	if err != nil {
		return nil, err
	}

	result := make([]SplitGroupResponse, 0, len(items))

	for _, item := range items {
		result = append(result, mapSplitGroupToResponse(item))
	}

	return result, nil
}

func (s *SplitGroupService) GetActive() ([]SplitGroupResponse, error) {
	items, err := s.Repo.GetActive()
	if err != nil {
		return nil, err
	}

	result := make([]SplitGroupResponse, 0, len(items))

	for _, item := range items {
		result = append(result, mapSplitGroupToResponse(item))
	}

	return result, nil
}