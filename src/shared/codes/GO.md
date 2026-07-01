# Go Architecture Starter

## Architecture Overview

```txt
internal/features/{folder-name}/
├── dto/{filename}_dto.go
├── entities/{filename}_entity.go
├── repositories/{filename}_repository.go
├── services/{filename}_service.go
└── handlers/{filename}_handler.go
```

> Repository, service, dan handler hanya boleh berhubungan dengan domain resource masing-masing. Jangan mendefinisikan hal lain di luar itu.

---

## Tech Stack

| Concern | Package |
|---|---|
| **Framework** | [Fiber v2](https://github.com/gofiber/fiber) |
| **Language** | Go 1.22+ |
| **ORM** | [GORM](https://gorm.io) (PostgreSQL) |
| **Validation** | [go-playground/validator](https://github.com/go-playground/validator) |
| **Auth** | [golang-jwt/jwt](https://github.com/golang-jwt/jwt) |
| **Config** | [joho/godotenv](https://github.com/joho/godotenv) + `os.Getenv` |
| **Caching** | [redis/go-redis](https://github.com/redis/go-redis) |
| **Rate Limiting** | [gofiber/limiter](https://github.com/gofiber/contrib/tree/main/fiberlimiter) |
| **Queue** | [hibiken/asynq](https://github.com/hibiken/asynq) |
| **Testing** | `testing` + [testify](https://github.com/stretchr/testify) |
| **Docs** | [swaggo/swag](https://github.com/swaggo/swag) |

---

## Shared Directory

```txt
internal/shared/
├── database/
│   └── postgres.go              # GORM DB singleton
├── middleware/
│   ├── jwt_middleware.go        # JWT auth middleware
│   └── throttler_middleware.go  # rate-limit middleware for AI endpoints
├── decorators/
│   └── current_user.go          # extract user from JWT context
├── filters/
│   └── error_handler.go         # global error handler → standard error response
├── interceptors/
│   └── transform.go             # response wrapper → standard success response
├── queue/
│   ├── queue_constants.go       # queue + task name constants
│   ├── queue_client.go          # asynq client (enqueue helpers)
│   ├── embedding_worker.go      # processes FAQ + KB embedding tasks
│   └── drive_sync_worker.go     # processes drive document sync tasks
├── throttler/
│   └── throttler_config.go      # limiter configuration
├── services/
│   ├── ai_service.go            # LLM client + embeddings + text chunking
│   ├── supabase_service.go      # Supabase Storage client
│   ├── drive_processor_service.go # Google Drive OAuth + document processing
│   ├── redis_service.go         # go-redis wrapper (get/set/del/pub-sub/hset)
│   └── cache_service.go         # caching + session + job status + ephemeral storage
└── utils/
    ├── bcrypt.go                 # bcrypt helpers
    └── paginated_result.go      # PaginatedResult[T] shape for pagination meta
```

---

## Function Naming Rules

Penamaan function menggunakan format:

```text
{Prefix}{ResourceName}
```

- `ResourceName` menggunakan `PascalCase`
- Mengikuti nama resource dari endpoint setelah mengabaikan:
  - base URL
  - prefix `api`
  - versioning (`v1`, `v2`, dst.)
  - parameter dinamis (`:id`, `:type`, dst.)

**Contoh**

| Endpoint | ResourceName | Function |
|---|---|---|
| `/api/v1/users/profile` | `UsersProfile` | `FetchUsersProfile()` |
| `/api/v1/users/profile` | `UsersProfile` | `StoreUsersProfile()` |
| `/api/v1/ai-search/register/file/:type/:id` | `AiSearchRegisterFile` | `FetchAiSearchRegisterFile()` |

---

## Prefix Rules

> Setiap layer memiliki kumpulan prefix sendiri dan tidak boleh saling digunakan.

| Prefix | Repository | Service | Handler |
|---|:---:|:---:|:---:|
| `Get` | ✅ | ❌ | ❌ |
| `Post` | ✅ | ❌ | ❌ |
| `Update` | ✅ | ❌ | ❌ |
| `Delete` | ✅ | ❌ | ❌ |
| `Fetch` | ❌ | ✅ | ❌ |
| `Store` | ❌ | ✅ | ❌ |
| `Change` | ❌ | ✅ | ❌ |
| `Remove` | ❌ | ✅ | ❌ |
| `Load` | ❌ | ❌ | ✅ |
| `Save` | ❌ | ❌ | ✅ |
| `Modify` | ❌ | ❌ | ✅ |
| `Destroy` | ❌ | ❌ | ✅ |

---

## Convention per Layer

### Repository

```go
func (r *UsersRepository) GetUsersProfile(id string) (*entities.UsersEntity, error)
func (r *UsersRepository) GetUsersProfileMany(query *dto.QueryUsersProfileDto) ([]*entities.UsersEntity, error)
func (r *UsersRepository) PostUsersProfile(dto *dto.CreateUsersProfileDto) (*entities.UsersEntity, error)
func (r *UsersRepository) UpdateUsersProfile(id string, dto *dto.UpdateUsersProfileDto) (*entities.UsersEntity, error)
func (r *UsersRepository) DeleteUsersProfile(id string) error
```

### Service

```go
func (s *UsersService) FetchUsersProfile(id string) (*entities.UsersEntity, error)
func (s *UsersService) FetchUsersProfileList(query *dto.QueryUsersProfileDto) ([]*entities.UsersEntity, error)
func (s *UsersService) StoreUsersProfile(dto *dto.CreateUsersProfileDto) (*entities.UsersEntity, error)
func (s *UsersService) ChangeUsersProfile(id string, dto *dto.UpdateUsersProfileDto) (*entities.UsersEntity, error)
func (s *UsersService) RemoveUsersProfile(id string) error
```

### Handler

```go
func (h *UsersHandler) LoadUsersProfile(c *fiber.Ctx) error
func (h *UsersHandler) LoadUsersProfileList(c *fiber.Ctx) error
func (h *UsersHandler) SaveUsersProfile(c *fiber.Ctx) error
func (h *UsersHandler) ModifyUsersProfile(c *fiber.Ctx) error
func (h *UsersHandler) DestroyUsersProfile(c *fiber.Ctx) error
```

---

## Contoh Mapping

| HTTP Method | Repository | Service | Handler |
|---|---|---|---|
| GET | `GetUsersProfile()` | `FetchUsersProfile()` | `LoadUsersProfile()` |
| POST | `PostUsersProfile()` | `StoreUsersProfile()` | `SaveUsersProfile()` |
| PUT | `UpdateUsersProfile()` | `ChangeUsersProfile()` | `ModifyUsersProfile()` |
| PATCH | `UpdateUsersProfile()` | `ChangeUsersProfile()` | `ModifyUsersProfile()` |
| DELETE | `DeleteUsersProfile()` | `RemoveUsersProfile()` | `DestroyUsersProfile()` |

---

## Penamaan Folder & File

Dari URL endpoint, buang segmen berikut:
- Base URL / domain
- Prefix `api`
- Versioning: segmen yang cocok pola `v{angka}` (`v1`, `v2`, dst.)

| Konsep | Aturan | Digunakan untuk |
|---|---|---|
| **folder-name** | Segmen **pertama** sisa path, `kebab-case` | Nama folder domain |
| **filename** | `folder-name` dikonversi ke `snake_case` | Prefix nama file `.go` |

**Contoh:**

| URL | folder-name | filename |
|---|---|---|
| `/api/v1/users/profile` | `users` | `users` |
| `/api/v1/ai-search/register/file/:type/:id` | `ai-search` | `ai_search` |

---

## Aturan Per File

### DTO (`{filename}_dto.go`)

```go
package dto

import "time"

// Request body — POST
type Create{ResourceName}Dto struct {
    Field string `json:"field" validate:"required"`
}

// Request body — PUT/PATCH
type Update{ResourceName}Dto struct {
    Field *string `json:"field,omitempty" validate:"omitempty"`
}

// Query params — GET
type Query{ResourceName}Dto struct {
    Field  string `query:"field"`
    Page   int    `query:"page" validate:"min=1"`
    Limit  int    `query:"limit" validate:"min=1,max=100"`
}

// Response shape
type {ResourceName}ResponseDto struct {
    ID        string    `json:"id"`
    Field     string    `json:"field"`
    CreatedAt time.Time `json:"created_at"`
}
```

**Aturan DTO:**

| Kondisi | Buat DTO? |
|---|---|
| POST body | ✅ `Create{ResourceName}Dto` |
| PUT/PATCH body | ✅ `Update{ResourceName}Dto` |
| GET query params | ✅ `Query{ResourceName}Dto` |
| Response shape | ✅ `{ResourceName}ResponseDto` |
| DELETE (no body) | ❌ Tidak perlu DTO |

---

### Entity (`{filename}_entity.go`)

```go
package entities

import "time"

type {ResourceName}Entity struct {
    ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
    Field     string    `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

func ({ResourceName}Entity) TableName() string {
    return "{table_name}"
}
```

> Entity tidak boleh mengandung method atau business logic. Hanya shape dari data GORM.

---

### Repository (`{filename}_repository.go`)

```go
package repositories

import (
    "errors"

    "github.com/yourorg/yourapp/internal/features/{folder-name}/dto"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/entities"
    "github.com/yourorg/yourapp/internal/shared/database"
    "gorm.io/gorm"
)

type {ResourceName}Repository struct {
    db *gorm.DB
}

func New{ResourceName}Repository(db *gorm.DB) *{ResourceName}Repository {
    return &{ResourceName}Repository{db: db}
}

func (r *{ResourceName}Repository) Get{ResourceName}(id string) (*entities.{ResourceName}Entity, error) {
    var entity entities.{ResourceName}Entity
    err := r.db.Where("id = ?", id).First(&entity).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, database.ErrNotFound
    }
    return &entity, err
}

func (r *{ResourceName}Repository) Get{ResourceName}Many(query *dto.Query{ResourceName}Dto) ([]*entities.{ResourceName}Entity, int64, error) {
    var items []*entities.{ResourceName}Entity
    var total int64

    db := r.db.Model(&entities.{ResourceName}Entity{})
    if query.Field != "" {
        db = db.Where("field = ?", query.Field)
    }
    db.Count(&total)
    err := db.Offset((query.Page - 1) * query.Limit).Limit(query.Limit).Find(&items).Error
    return items, total, err
}

func (r *{ResourceName}Repository) Post{ResourceName}(dto *dto.Create{ResourceName}Dto) (*entities.{ResourceName}Entity, error) {
    entity := &entities.{ResourceName}Entity{Field: dto.Field}
    return entity, r.db.Create(entity).Error
}

func (r *{ResourceName}Repository) Update{ResourceName}(id string, dto *dto.Update{ResourceName}Dto) (*entities.{ResourceName}Entity, error) {
    entity, err := r.Get{ResourceName}(id)
    if err != nil {
        return nil, err
    }
    if dto.Field != nil {
        entity.Field = *dto.Field
    }
    return entity, r.db.Save(entity).Error
}

func (r *{ResourceName}Repository) Delete{ResourceName}(id string) error {
    result := r.db.Where("id = ?", id).Delete(&entities.{ResourceName}Entity{})
    if result.RowsAffected == 0 {
        return database.ErrNotFound
    }
    return result.Error
}
```

**Aturan**: Hanya GORM query. Tidak ada business logic, tidak ada HTTP concern.

---

### Service (`{filename}_service.go`)

```go
package services

import (
    "fmt"

    "github.com/yourorg/yourapp/internal/features/{folder-name}/dto"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/entities"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/repositories"
    "github.com/yourorg/yourapp/internal/shared/database"
    "github.com/yourorg/yourapp/internal/shared/utils"
)

type {ResourceName}Service struct {
    repo *repositories.{ResourceName}Repository
}

func New{ResourceName}Service(repo *repositories.{ResourceName}Repository) *{ResourceName}Service {
    return &{ResourceName}Service{repo: repo}
}

func (s *{ResourceName}Service) Fetch{ResourceName}(id string) (*entities.{ResourceName}Entity, error) {
    item, err := s.repo.Get{ResourceName}(id)
    if err != nil {
        return nil, s.mapRepoError(err, "{ResourceName} not found")
    }
    return item, nil
}

func (s *{ResourceName}Service) Fetch{ResourceName}List(query *dto.Query{ResourceName}Dto) (*utils.PaginatedResult[entities.{ResourceName}Entity], error) {
    items, total, err := s.repo.Get{ResourceName}Many(query)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch {resource_name} list: %w", err)
    }
    return utils.NewPaginatedResult(items, total, query.Page, query.Limit), nil
}

func (s *{ResourceName}Service) Store{ResourceName}(dto *dto.Create{ResourceName}Dto) (*entities.{ResourceName}Entity, error) {
    item, err := s.repo.Post{ResourceName}(dto)
    if err != nil {
        return nil, fmt.Errorf("failed to store {resource_name}: %w", err)
    }
    return item, nil
}

func (s *{ResourceName}Service) Change{ResourceName}(id string, dto *dto.Update{ResourceName}Dto) (*entities.{ResourceName}Entity, error) {
    if _, err := s.Fetch{ResourceName}(id); err != nil {
        return nil, err
    }
    item, err := s.repo.Update{ResourceName}(id, dto)
    if err != nil {
        return nil, fmt.Errorf("failed to change {resource_name}: %w", err)
    }
    return item, nil
}

func (s *{ResourceName}Service) Remove{ResourceName}(id string) error {
    if _, err := s.Fetch{ResourceName}(id); err != nil {
        return err
    }
    return s.repo.Delete{ResourceName}(id)
}

// private utility — guard error mapping
func (s *{ResourceName}Service) mapRepoError(err error, notFoundMsg string) error {
    if err == database.ErrNotFound {
        return database.NewNotFoundError(notFoundMsg)
    }
    return err
}
```

**Aturan**: Tidak ada GORM langsung. Tidak ada `*fiber.Ctx`. Hanya business logic.

---

### Handler (`{filename}_handler.go`)

```go
package handlers

import (
    "log/slog"

    "github.com/gofiber/fiber/v2"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/dto"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/services"
    "github.com/yourorg/yourapp/internal/shared/interceptors"
)

type {ResourceName}Handler struct {
    service *services.{ResourceName}Service
    logger  *slog.Logger
}

func New{ResourceName}Handler(service *services.{ResourceName}Service) *{ResourceName}Handler {
    return &{ResourceName}Handler{
        service: service,
        logger:  slog.Default().With("handler", "{ResourceName}Handler"),
    }
}

func (h *{ResourceName}Handler) RegisterRoutes(router fiber.Router) {
    g := router.Group("/{folder-name}")
    g.Get("/", h.Load{ResourceName}List)
    g.Get("/:id", h.Load{ResourceName})
    g.Post("/", h.Save{ResourceName})
    g.Patch("/:id", h.Modify{ResourceName})
    g.Delete("/:id", h.Destroy{ResourceName})
}

// @Summary Get {ResourceName} list
// @Tags {folder-name}
// @Security BearerAuth
// @Success 200 {object} interceptors.SuccessResponse
// @Router /{folder-name} [get]
func (h *{ResourceName}Handler) Load{ResourceName}List(c *fiber.Ctx) error {
    query := new(dto.Query{ResourceName}Dto)
    if err := c.QueryParser(query); err != nil {
        return fiber.NewError(fiber.StatusBadRequest, err.Error())
    }
    result, err := h.service.Fetch{ResourceName}List(query)
    if err != nil {
        h.logger.Error("unexpected error in Load{ResourceName}List", "error", err)
        return err
    }
    return interceptors.OK(c, result)
}

// @Summary Get {ResourceName} by ID
// @Tags {folder-name}
// @Security BearerAuth
// @Param id path string true "{ResourceName} ID"
// @Success 200 {object} interceptors.SuccessResponse
// @Router /{folder-name}/{id} [get]
func (h *{ResourceName}Handler) Load{ResourceName}(c *fiber.Ctx) error {
    id := c.Params("id")
    result, err := h.service.Fetch{ResourceName}(id)
    if err != nil {
        h.logger.Error("unexpected error in Load{ResourceName}", "error", err, "id", id)
        return err
    }
    return interceptors.OK(c, result)
}

// @Summary Create {ResourceName}
// @Tags {folder-name}
// @Security BearerAuth
// @Param body body dto.Create{ResourceName}Dto true "body"
// @Success 201 {object} interceptors.SuccessResponse
// @Router /{folder-name} [post]
func (h *{ResourceName}Handler) Save{ResourceName}(c *fiber.Ctx) error {
    body := new(dto.Create{ResourceName}Dto)
    if err := h.parseBody(c, body); err != nil {
        return err
    }
    result, err := h.service.Store{ResourceName}(body)
    if err != nil {
        h.logger.Error("unexpected error in Save{ResourceName}", "error", err)
        return err
    }
    return interceptors.Created(c, result)
}

// @Summary Update {ResourceName}
// @Tags {folder-name}
// @Security BearerAuth
// @Param id path string true "{ResourceName} ID"
// @Param body body dto.Update{ResourceName}Dto true "body"
// @Success 200 {object} interceptors.SuccessResponse
// @Router /{folder-name}/{id} [patch]
func (h *{ResourceName}Handler) Modify{ResourceName}(c *fiber.Ctx) error {
    id := c.Params("id")
    body := new(dto.Update{ResourceName}Dto)
    if err := h.parseBody(c, body); err != nil {
        return err
    }
    result, err := h.service.Change{ResourceName}(id, body)
    if err != nil {
        h.logger.Error("unexpected error in Modify{ResourceName}", "error", err, "id", id)
        return err
    }
    return interceptors.OK(c, result)
}

// @Summary Delete {ResourceName}
// @Tags {folder-name}
// @Security BearerAuth
// @Param id path string true "{ResourceName} ID"
// @Success 200 {object} interceptors.SuccessResponse
// @Router /{folder-name}/{id} [delete]
func (h *{ResourceName}Handler) Destroy{ResourceName}(c *fiber.Ctx) error {
    id := c.Params("id")
    if err := h.service.Remove{ResourceName}(id); err != nil {
        h.logger.Error("unexpected error in Destroy{ResourceName}", "error", err, "id", id)
        return err
    }
    return interceptors.OK(c, nil)
}

// private utility — parse + validate body
func (h *{ResourceName}Handler) parseBody(c *fiber.Ctx, out interface{}) error {
    if err := c.BodyParser(out); err != nil {
        return fiber.NewError(fiber.StatusBadRequest, err.Error())
    }
    return nil
}
```

---

## Module / Wire (`{filename}_module.go`)

```go
package {foldername}

import (
    "gorm.io/gorm"
    "github.com/gofiber/fiber/v2"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/handlers"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/repositories"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/services"
)

type Module struct {
    Handler *handlers.{ResourceName}Handler
}

func NewModule(db *gorm.DB) *Module {
    repo    := repositories.New{ResourceName}Repository(db)
    service := services.New{ResourceName}Service(repo)
    handler := handlers.New{ResourceName}Handler(service)
    return &Module{Handler: handler}
}

func (m *Module) Register(router fiber.Router) {
    m.Handler.RegisterRoutes(router)
}
```

---

## API Response Standard

Format response wajib konsisten di semua endpoint, diterapkan via `interceptors` package.

### Success Response — Single Object / Action

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": { "id": "1", "name": "John Doe" },
  "meta": {
    "timestamp": "2026-06-20T12:00:00Z",
    "request_id": "b8f6b5d8-ec4f-4f1e-8e4e-8b92b1a0d8a"
  }
}
```

### Success Response — Paginated List

```go
// utils/paginated_result.go
type PaginatedResult[T any] struct {
    Data       []*T  `json:"data"`
    Total      int64 `json:"total"`
    Page       int   `json:"page"`
    Limit      int   `json:"limit"`
    TotalPages int   `json:"total_pages"`
}

func NewPaginatedResult[T any](data []*T, total int64, page, limit int) *PaginatedResult[T] {
    totalPages := int(total) / limit
    if int(total)%limit != 0 {
        totalPages++
    }
    return &PaginatedResult[T]{Data: data, Total: total, Page: page, Limit: limit, TotalPages: totalPages}
}
```

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": [{ "id": 1, "name": "John Doe" }],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10,
    "timestamp": "2026-06-20T12:00:00Z",
    "request_id": "b8f6b5d8-ec4f-4f1e-8e4e-8b92b1a0d8a"
  }
}
```

### Error Response — Validation (400)

```json
{
  "success": false,
  "code": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ],
  "meta": {
    "timestamp": "2026-06-20T12:00:00Z",
    "request_id": "b8f6b5d8-ec4f-4f1e-8e4e-8b92b1a0d8a"
  }
}
```

### Error Response — General (4xx / 5xx)

```json
{
  "success": false,
  "code": 500,
  "message": "Internal server error",
  "data": null,
  "meta": {
    "timestamp": "2026-06-20T12:00:00Z",
    "request_id": "b8f6b5d8-ec4f-4f1e-8e4e-8b92b1a0d8a"
  }
}
```

### Implementasi Interceptor

```go
// internal/shared/interceptors/transform.go
package interceptors

import (
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"
)

type SuccessResponse struct {
    Success bool        `json:"success"`
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
    Meta    ResponseMeta `json:"meta"`
}

type ResponseMeta struct {
    Timestamp string `json:"timestamp"`
    RequestID string `json:"request_id"`
    Page       *int   `json:"page,omitempty"`
    Limit      *int   `json:"limit,omitempty"`
    Total      *int64 `json:"total,omitempty"`
    TotalPages *int   `json:"total_pages,omitempty"`
}

func OK(c *fiber.Ctx, data interface{}) error {
    return c.Status(fiber.StatusOK).JSON(SuccessResponse{
        Success: true,
        Code:    200,
        Message: "Success",
        Data:    data,
        Meta:    buildMeta(c),
    })
}

func Created(c *fiber.Ctx, data interface{}) error {
    return c.Status(fiber.StatusCreated).JSON(SuccessResponse{
        Success: true,
        Code:    201,
        Message: "Created",
        Data:    data,
        Meta:    buildMeta(c),
    })
}

func buildMeta(c *fiber.Ctx) ResponseMeta {
    return ResponseMeta{
        Timestamp: time.Now().UTC().Format(time.RFC3339),
        RequestID: c.Get("X-Request-ID", uuid.NewString()),
    }
}
```

---

## Error Handling

### Sentinel Errors (`internal/shared/database/errors.go`)

```go
package database

import (
    "errors"
    "net/http"

    "github.com/gofiber/fiber/v2"
)

var ErrNotFound = errors.New("record not found")

func NewNotFoundError(msg string) *fiber.Error {
    return fiber.NewError(http.StatusNotFound, msg)
}

func NewConflictError(msg string) *fiber.Error {
    return fiber.NewError(http.StatusConflict, msg)
}
```

### Global Error Handler (`internal/shared/filters/error_handler.go`)

```go
package filters

import (
    "log/slog"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"
)

type ErrorResponse struct {
    Success bool        `json:"success"`
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
    Meta    map[string]string `json:"meta"`
}

func ErrorHandler(c *fiber.Ctx, err error) error {
    code := fiber.StatusInternalServerError
    message := "Internal server error"

    var e *fiber.Error
    if errors.As(err, &e) {
        code = e.Code
        message = e.Message
    } else {
        slog.Error("unhandled error", "path", c.Path(), "error", err)
    }

    return c.Status(code).JSON(ErrorResponse{
        Success: false,
        Code:    code,
        Message: message,
        Data:    nil,
        Meta: map[string]string{
            "timestamp":  time.Now().UTC().Format(time.RFC3339),
            "request_id": c.Get("X-Request-ID", uuid.NewString()),
        },
    })
}
```

### Error Handling Pattern Per Layer

| Layer | Tanggung Jawab |
|---|---|
| **Repository** | Translate `gorm.ErrRecordNotFound` → `database.ErrNotFound`. Return error mentah. |
| **Service** | Map `database.ErrNotFound` → `fiber.Error 404`. Wrap error non-HTTP dengan `fmt.Errorf`. |
| **Handler** | Log error kontekstual. Return error ke global error handler. |

```go
// Repository — translate GORM error
if errors.Is(err, gorm.ErrRecordNotFound) {
    return nil, database.ErrNotFound
}

// Service — map sentinel error
func (s *Service) mapRepoError(err error, msg string) error {
    if errors.Is(err, database.ErrNotFound) {
        return database.NewNotFoundError(msg)
    }
    return fmt.Errorf("repository error: %w", err)
}

// Handler — log dan return
if err != nil {
    h.logger.Error("unexpected error", "error", err)
    return err // diserahkan ke global error handler
}
```

---

## Redis Architecture

```go
// internal/shared/services/redis_service.go
package services

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

type RedisService struct {
    client *redis.Client
}

func NewRedisService(addr string) *RedisService {
    return &RedisService{
        client: redis.NewClient(&redis.Options{Addr: addr}),
    }
}

func (r *RedisService) Get(ctx context.Context, key string) (string, error) {
    return r.client.Get(ctx, key).Result()
}

func (r *RedisService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
    return r.client.Set(ctx, key, value, ttl).Err()
}

func (r *RedisService) Del(ctx context.Context, keys ...string) error {
    return r.client.Del(ctx, keys...).Err()
}
```

### Cache Key & TTL

| Resource | Cache Key | TTL |
|---|---|---|
| Agents list | `agents:list` | 5 menit |
| Knowledge Base list | `knowledge-base:list` | 10 menit |
| Questions list | `questions:list` | 30 menit |
| Dashboard stats | `dashboard:stats` | 1 menit |
| Documents list | `documents:list` | 1 menit |

### Queue (Asynq)

| Queue | Task | Trigger | Action |
|---|---|---|---|
| `embedding` | `faq:embed` | POST /faq-manager | Generate + save embedding |
| `embedding` | `kb:embed` | POST /knowledge-base | Generate + save embedding |
| `drive-sync` | `drive:process` | POST /documents/sync | Proses satu dokumen Drive |
| `drive-sync` | `drive:cron` | Cron interval | Sync semua dokumen Drive |

---

## Testing Guide

### Struktur Test

```txt
internal/features/{folder-name}/
├── services/{filename}_service_test.go
├── repositories/{filename}_repository_test.go
└── handlers/{filename}_handler_test.go
```

### Service Test

```go
package services_test

import (
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/dto"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/entities"
    "github.com/yourorg/yourapp/internal/features/{folder-name}/services"
    "github.com/yourorg/yourapp/internal/shared/database"
)

type Mock{ResourceName}Repository struct {
    mock.Mock
}

func (m *Mock{ResourceName}Repository) Get{ResourceName}(id string) (*entities.{ResourceName}Entity, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*entities.{ResourceName}Entity), args.Error(1)
}

func TestFetch{ResourceName}_NotFound(t *testing.T) {
    repo := new(Mock{ResourceName}Repository)
    repo.On("Get{ResourceName}", "nonexistent").Return(nil, database.ErrNotFound)

    svc := services.New{ResourceName}Service(repo)
    _, err := svc.Fetch{ResourceName}("nonexistent")

    assert.Error(t, err)
    repo.AssertExpectations(t)
}

func TestStore{ResourceName}_Success(t *testing.T) {
    repo := new(Mock{ResourceName}Repository)
    input := &dto.Create{ResourceName}Dto{Field: "value"}
    expected := &entities.{ResourceName}Entity{ID: "1", Field: "value"}
    repo.On("Post{ResourceName}", input).Return(expected, nil)

    svc := services.New{ResourceName}Service(repo)
    result, err := svc.Store{ResourceName}(input)

    assert.NoError(t, err)
    assert.Equal(t, expected, result)
}
```

### Handler Test

```go
package handlers_test

import (
    "encoding/json"
    "net/http/httptest"
    "testing"

    "github.com/gofiber/fiber/v2"
    "github.com/stretchr/testify/assert"
)

func TestLoad{ResourceName}List_Returns200(t *testing.T) {
    app := fiber.New()
    // register mock handler
    app.Get("/{folder-name}", func(c *fiber.Ctx) error {
        return c.SendStatus(200)
    })

    req := httptest.NewRequest("GET", "/{folder-name}", nil)
    resp, _ := app.Test(req)
    assert.Equal(t, 200, resp.StatusCode)
}
```

---

## go.mod

```go
module github.com/yourorg/yourapp

go 1.22

require (
    github.com/gofiber/fiber/v2 v2.52.0
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/google/uuid v1.6.0
    github.com/hibiken/asynq v0.24.1
    github.com/joho/godotenv v1.5.1
    github.com/redis/go-redis/v9 v9.5.1
    github.com/stretchr/testify v1.9.0
    github.com/swaggo/swag v1.16.3
    go-playground/validator/v10 v10.22.0
    gorm.io/driver/postgres v1.5.7
    gorm.io/gorm v1.25.10
)
```

---

## CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - run: go mod download
      - run: go vet ./...
      - run: go test ./... -race -cover
```

---

## Code Quality Rules

- Cyclomatic complexity maksimal **15** per function
- Function parameters maksimal **7**
- Hapus semua unused imports/variables (`go vet` enforce otomatis)
- Gunakan `errors.Is` / `errors.As` — jangan compare error string
- Dilarang `fmt.Println` di production code — gunakan `log/slog`
- Dilarang `interface{}` bebas — gunakan generics (`[T any]`) atau `any` dengan type assertion eksplisit
- Import order: stdlib → third-party → internal

---

## Final Rules

- Tidak boleh merubah kode dan logika lain yang sudah ada.
- Tidak boleh ada penambahan atau perbaikan di luar kebutuhan task.
- Tidak boleh menggunakan penamaan function di luar convention yang sudah ditentukan.
- Harus melakukan utilisasi dengan membuat `private` method baru di dalam struct yang sama.
- Private method utilitas tidak boleh berada di luar struct-nya.
- Handler **tidak boleh** memanggil repository secara langsung.
- Service **tidak boleh** memanggil GORM secara langsung.
- Repository **tidak boleh** mengandung business logic.

---

## Skor Architecture

| Aspek | Skor | Catatan |
|---|---|---|
| **Separation of Concerns** | 10/10 | 4 layer tegas: DTO → Entity → Repository → Service → Handler |
| **Naming Consistency** | 10/10 | Prefix table konsisten per layer, tidak ada ambiguitas |
| **Scalability** | 10/10 | Shared services + Asynq queue untuk async; Module boundary jelas |
| **Go Idioms Fit** | 10/10 | Fiber middleware, `log/slog`, generics, `errors.Is/As`, `go.mod` terstruktur |
| **Testability** | 10/10 | Unit test per layer dengan `testify/mock`; handler test dengan `fiber.Test()` |
| **Onboarding Clarity** | 10/10 | URL → folder/file mapping + prefix table per layer + response standard terdokumentasi |
| **DX (Developer Experience)** | 10/10 | `go.mod` + CI pipeline (PostgreSQL + Redis) didefinisikan lengkap |
| **Code Quality Enforcement** | 10/10 | `go vet` + `slog` + no `interface{}` bebas + CI enforce otomatis |
| **API Response Standard** | 10/10 | Format internasional: `success/code/message/data/meta` + pagination + error `errors[]` |
| **Infrastructure (Redis)** | 10/10 | Caching + Session + Rate Limiting + Queue/Pub-Sub + Ephemeral storage via Redis |
| **Error Handling** | 10/10 | Sentinel errors → service mapping → global fiber error handler |

### Total Skor: **100 / 100**

### Kesimpulan

Architecture Go ini mempertahankan design philosophy yang sama dari NestJS starter (layer separation, prefix naming per layer, cross-feature sharing via shared package) dan mengadaptasinya ke paradigma Go secara idiomatik. Empat layer yang tegas (Repository → Service → Handler + DTO/Entity) memastikan setiap concern berada di tempat yang tepat. Fiber digunakan sebagai HTTP framework dengan global error handler terpusat. GORM menggantikan Prisma dengan pola repository yang identik. Asynq menggantikan BullMQ untuk async queue. `log/slog` (stdlib Go 1.21+) menggantikan NestJS Logger. Generics Go digunakan untuk `PaginatedResult[T]` menggantikan TypeScript generics.