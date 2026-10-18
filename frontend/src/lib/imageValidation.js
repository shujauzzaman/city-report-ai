export const MAX_IMAGE_MB = 20
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'jfif', 'png', 'webp']

// Returns an error message if the file is not acceptable, or null if it is fine
export function validateImageFile(file) {
  if (!file) return 'No file selected.'

  const extension = file.name.split('.').pop().toLowerCase()
  const typeOk = file.type
    ? ALLOWED_TYPES.includes(file.type)
    : ALLOWED_EXTENSIONS.includes(extension)

  if (!typeOk) {
    return 'Unsupported file. Please upload a JPG, PNG or WebP image.'
  }

  if (file.size === 0) {
    return 'This file is empty. Please choose another image.'
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return `This image is ${sizeMb} MB. The maximum allowed size is ${MAX_IMAGE_MB} MB.`
  }

  return null
}