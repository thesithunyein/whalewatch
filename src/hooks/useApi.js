import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(url, options = {}) {
  const { interval = 0, enabled = true, transform, fallback = null } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!mountedRef.current) return
      setData(transform ? transform(json) : json)
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message)
      if (fallback !== null) setData(fallback)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [url, enabled])

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    fetchData()
    if (interval > 0) {
      timerRef.current = setInterval(fetchData, interval)
    }
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchData, interval])

  return { data, loading, error, refetch: fetchData }
}

export function useMultiFetch(urls, options = {}) {
  const { interval = 0, enabled = true } = options
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchAll = useCallback(async () => {
    if (!urls?.length || !enabled) return
    try {
      const results = await Promise.allSettled(
        urls.map((url) => fetch(url).then((r) => r.json()))
      )
      if (!mountedRef.current) return
      setData(results.map((r) => (r.status === 'fulfilled' ? r.value : null)))
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [JSON.stringify(urls), enabled])

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    fetchAll()
    if (interval > 0) {
      timerRef.current = setInterval(fetchAll, interval)
    }
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchAll, interval])

  return { data, loading, error, refetch: fetchAll }
}
