package utils

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"golang.org/x/sync/errgroup"
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

	urls := make([]string, len(files))
	g, ctx := errgroup.WithContext(ctx)

	for i, fileHeader := range files {
		i, fileHeader := i, fileHeader // capture loop variables
		g.Go(func() error {
			file, err := fileHeader.Open()
			if err != nil {
				return fmt.Errorf("failed to open file at index %d: %w", i, err)
			}
			defer file.Close()

			resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
				Folder: folder,
			})
			if err != nil {
				return fmt.Errorf("failed to upload file at index %d to Cloudinary: %w", i, err)
			}

			urls[i] = resp.SecureURL
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	return urls, nil
}
