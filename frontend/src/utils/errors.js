export function getApiErrorMessage(error) {
  const data = error.response?.data
  if (!data) {
    return 'Something went wrong. Please try again.'
  }
  if (typeof data.detail === 'string') {
    return data.detail
  }
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const value = data[firstKey]
    if (Array.isArray(value)) {
      return `${firstKey}: ${value[0]}`
    }
    if (typeof value === 'string') {
      return value
    }
  }
  return 'Something went wrong. Please try again.'
}
