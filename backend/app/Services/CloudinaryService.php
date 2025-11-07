<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;
use Exception;
use Cloudinary\Transformation\Resize;

class CloudinaryService
{
    protected $cloudinary;
    protected $uploadApi;

    public function __construct()
    {
        $config = [
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => [
                'secure' => config('cloudinary.secure', true)
            ]
        ];

        $this->cloudinary = new Cloudinary($config);
        
        // CRITICAL FIX: Pass config to UploadApi
        $this->uploadApi = new UploadApi($config);
    }

    /**
     * Upload a single image to Cloudinary
     * 
     * @param mixed $file - File from request or base64 string
     * @param string $folder - Folder path in Cloudinary
     * @param array $options - Additional upload options
     * @return array
     */
    public function uploadImage($file, $folder = 'oshocks/products', $options = [])
    {
        try {
            // Default options
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image',
                'transformation' => [
                    'quality' => 'auto',
                    'fetch_format' => 'auto'
                ]
            ];

            // Merge with custom options
            $uploadOptions = array_merge($defaultOptions, $options);

            // Handle different file types
            if (is_string($file) && strpos($file, 'data:image') === 0) {
                // Base64 image
                $result = $this->uploadApi->upload($file, $uploadOptions);
            } elseif (is_object($file) && method_exists($file, 'getRealPath')) {
                // Uploaded file from request
                $result = $this->uploadApi->upload($file->getRealPath(), $uploadOptions);
            } else {
                throw new Exception('Invalid file format');
            }

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'url' => $result['secure_url'],
                'thumbnail_url' => $this->getTransformedUrl($result['public_id'], 'thumbnail'),
                'medium_url' => $this->getTransformedUrl($result['public_id'], 'medium'),
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'size' => $result['bytes']
            ];

        } catch (Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Upload multiple images
     * 
     * @param array $files
     * @param string $folder
     * @return array
     */
    public function uploadMultipleImages($files, $folder = 'oshocks/products')
    {
        $results = [];
        
        foreach ($files as $file) {
            $result = $this->uploadImage($file, $folder);
            if ($result['success']) {
                $results[] = $result;
            }
        }

        return $results;
    }

    /**
     * Delete an image from Cloudinary
     * 
     * @param string $publicId
     * @return bool
     */
    public function deleteImage($publicId)
    {
        try {
            $this->uploadApi->destroy($publicId, ['resource_type' => 'image']);
            return true;
        } catch (Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete multiple images
     * 
     * @param array $publicIds
     * @return bool
     */
    public function deleteMultipleImages($publicIds)
    {
        try {
            foreach ($publicIds as $publicId) {
                $this->deleteImage($publicId);
            }
            return true;
        } catch (Exception $e) {
            Log::error('Cloudinary bulk delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get transformed image URL
     * 
     * @param string $publicId
     * @param string $transformation - 'thumbnail', 'medium', 'large'
     * @return string
     */
    public function getTransformedUrl($publicId, $transformation = 'medium')
    {
        $transformations = config('cloudinary.transformations');
        
        if (!isset($transformations[$transformation])) {
            $transformation = 'medium';
        }

        $transform = $transformations[$transformation];
        
        // Get the image
        $image = $this->cloudinary->image($publicId);
        
        // Apply resize transformation based on crop type
        $width = $transform['width'] ?? null;
        $height = $transform['height'] ?? null;
        $crop = $transform['crop'] ?? 'fill';
        
        if ($width && $height) {
            switch ($crop) {
                case 'fill':
                    $image->resize(Resize::fill()->width($width)->height($height));
                    break;
                case 'limit':
                    $image->resize(Resize::limit()->width($width)->height($height));
                    break;
                case 'fit':
                    $image->resize(Resize::fit()->width($width)->height($height));
                    break;
                case 'scale':
                    $image->resize(Resize::scale()->width($width)->height($height));
                    break;
                default:
                    $image->resize(Resize::fill()->width($width)->height($height));
            }
        } elseif ($width) {
            $image->resize(Resize::scale()->width($width));
        } elseif ($height) {
            $image->resize(Resize::scale()->height($height));
        }
        
        return $image->toUrl();
    }

    /**
     * Extract public_id from Cloudinary URL
     * 
     * @param string $url
     * @return string|null
     */
    public function extractPublicId($url)
    {
        try {
            // Extract public_id from URL
            // Example: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/image.jpg
            preg_match('/\/v\d+\/(.+)\.\w+$/', $url, $matches);
            return $matches[1] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get image details from Cloudinary
     * 
     * @param string $publicId
     * @return array|null
     */
    public function getImageDetails($publicId)
    {
        try {
            $result = $this->uploadApi->explicit($publicId, ['type' => 'upload']);
            return [
                'public_id' => $result['public_id'],
                'url' => $result['secure_url'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'size' => $result['bytes']
            ];
        } catch (Exception $e) {
            Log::error('Failed to get image details: ' . $e->getMessage());
            return null;
        }
    }
}