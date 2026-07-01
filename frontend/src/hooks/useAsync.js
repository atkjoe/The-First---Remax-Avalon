import { useCallback, useEffect, useState } from "react";

export function useAsync(fn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(Boolean(options.immediate ?? true));
  const [error, setError] = useState("");

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError("");
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.friendlyMessage || "Unable to load data";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (options.immediate === false) {
      setLoading(false);
      return;
    }
    run().catch(() => {});
  }, [run, options.immediate]);

  return { data, setData, loading, error, run };
}
