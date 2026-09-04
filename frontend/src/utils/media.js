export function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

export function getMediaUrl(imagePath) {
  if (!imagePath) {
    return null
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const origin = getBackendOrigin()
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${origin}${path}`
}

export function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) {
    return price
  }
  return `₹${value.toFixed(value % 1 === 0 ? 0 : 2)}`
}
