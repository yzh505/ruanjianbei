// 第四步：自定义 Hook - src/hooks/useRequest.js
import { useState } from 'react';

export const useRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async (request, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request(...args);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, error };
};