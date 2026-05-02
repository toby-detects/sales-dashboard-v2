import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

export const getProducts = () => api.get('/products')
export const createProduct = (data) => api.post('/products', data)
export const getProductAnalytics = (id, view) => api.get(`/products/${id}/analytics?view=${view}`)
export const getProductForecast = (id, view) => api.get(`/forecast/product/${id}?view=${view}`)
export const getOverallSales = (view) => api.get(`/sales/overall?view=${view}`)
export const getOverallForecast = (view) => api.get(`/forecast/overall?view=${view}`)
export const simulateSale = (product_id) => api.post('/sales/simulate', { product_id })
export const getCategories = () => api.get('/categories')
export const confirmTransaction = (data) => api.post('/transactions', data)
export const getTransactions = () => api.get('/transactions')
