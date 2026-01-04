package utils

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

// UploadToCloudinary uploads multiple files to Cloudinary and returns their URLs
func UploadToCloudinary(ctx context.Context, files []*multipart.FileHeader, cfg *config.Config, folder string) ([]string, error) {
	if len(files) == 0 {
		return nil, nil
	}

	cld, err := cloudinary.NewFromParams(cfg.CLOUDINARY_CLOUD_NAME, cfg.CLOUDINARY_API_KEY, cfg.CLOUDINARY_API_SECRET)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Cloudinary: %w", err)
	}

	var urls []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open file: %w", err)
		}
		defer file.Close()

		resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
			Folder: folder,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to upload to Cloudinary: %w", err)
		}

		urls = append(urls, resp.SecureURL)
	}

	return urls, nil
}
