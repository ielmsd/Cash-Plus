import { useState, useCallback } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const config = { method, url, ...options }
      if (data) config.data = data
      const response = await api(config)
      return { data: response.data, success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      const errors = err.response?.data?.errors || null
      setError({ message: msg, errors })
      if (!options.silent) toast.error(msg)
      return { data: null, success: false, errors }
    } finally {
      setLoading(false)
    }
  }, [])

  const get = (url, params = {}) => request('get', url, null, { params })
  const post = (url, data) => request('post', url, data)
  const put = (url, data) => request('put', url, data)
  const patch = (url, data) => request('patch', url, data)
  const del = (url) => request('delete', url)

  return { loading, error, get, post, put, patch, del }
}
