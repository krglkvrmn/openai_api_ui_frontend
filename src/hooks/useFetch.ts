import { useState, useEffect } from 'react';

export default function useFetch(url: string, options: RequestInit) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, {signal: controller.signal, ...options}).then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    }).then(result => {
        setData(result);
    }).catch(error => {
        setError(error);
    }).finally(() => {
        setLoading(false);
    });
    return () => controller.abort();
  }, []);

  return { data, error, loading };
}