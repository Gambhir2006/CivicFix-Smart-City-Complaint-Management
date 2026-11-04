import cloudinary
import cloudinary.uploader
from app.config import settings
from typing import Optional


def configure_cloudinary():
    """Configure Cloudinary SDK"""
    if settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )


def upload_image(file, folder: str = "civicfix") -> Optional[str]:
    """
    Upload an image to Cloudinary
    Returns the secure URL of the uploaded image
    """
    try:
        if not settings.CLOUDINARY_CLOUD_NAME:
            # Return a placeholder URL if Cloudinary is not configured
            return f"https://via.placeholder.com/500"

        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            allowed_formats=["jpg", "jpeg", "png", "webp"],
            max_file_size=5000000  # 5MB limit
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None


def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary"""
    try:
        if not settings.CLOUDINARY_CLOUD_NAME:
            return False

        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False
