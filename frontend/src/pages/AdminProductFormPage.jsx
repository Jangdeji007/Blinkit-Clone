import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getCategories } from '../api/categories'
import { createProduct, getProduct, updateProduct } from '../api/products'
import { getApiErrorMessage } from '../utils/errors'
import { getMediaUrl } from '../utils/media'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
}

function buildFormData(form, imageFile, isEdit = false) {
  const formData = new FormData()
  formData.append('name', form.name.trim())
  formData.append('description', form.description.trim())
  formData.append('price', form.price)
  formData.append('stock', form.stock)
  if (form.category) {
    formData.append('category', form.category)
  } else if (isEdit) {
    formData.append('category', '')
  }
  if (imageFile) {
    formData.append('image', imageFile)
  }
  return formData
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [currentImage, setCurrentImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setError('')
      try {
        const categoriesPromise = getCategories()
        const productPromise = isEdit ? getProduct(id) : Promise.resolve(null)

        const [categoriesRes, productRes] = await Promise.all([
          categoriesPromise,
          productPromise,
        ])

        if (cancelled) return

        setCategories(categoriesRes.data)

        if (productRes) {
          const product = productRes.data
          setForm({
            name: product.name || '',
            description: product.description || '',
            price: String(product.price ?? ''),
            stock: String(product.stock ?? ''),
            category: product.category ? String(product.category) : '',
          })
          setCurrentImage(product.image)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setImagePreviewUrl(getMediaUrl(currentImage))
    return undefined
  }, [imageFile, currentImage])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const formData = buildFormData(form, imageFile, isEdit)
      if (isEdit) {
        await updateProduct(id, formData)
      } else {
        await createProduct(formData)
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <main className="page-content admin-page"><p className="grid-message">Loading...</p></main>
  }

  return (
    <main className="page-content admin-page">
      <Link to="/admin/dashboard" className="back-link">← Back to dashboard</Link>
      <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="auth-input"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="auth-input admin-textarea"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              className="auth-input"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              className="auth-input"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="auth-input"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreviewUrl && (
            <div className="admin-form-preview">
              <img src={imagePreviewUrl} alt="Product preview" />
            </div>
          )}
        </div>

        <button type="submit" className="auth-btn" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </main>
  )
}
