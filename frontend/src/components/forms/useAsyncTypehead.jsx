import { useEffect, useState } from "react";

const useAsyncTypehead = (apiFn, delay = 500) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFn(query);
        setResults(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, apiFn, delay]);

  return { query, setQuery, results, loading };
};

export default useAsyncTypehead;
