import { useCallback, useEffect, useState } from 'react';

interface State<T> {
  data: T | null;
  loading: boolean;
  erro: string | null;
}

/** Carrega dados de uma função async e expõe loading/erro/reload. */
export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, erro: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setState((s) => ({ ...s, loading: true, erro: null }));
    fetcher()
      .then((data) => !cancelado && setState({ data, loading: false, erro: null }))
      .catch((e: Error) => !cancelado && setState({ data: null, loading: false, erro: e.message }));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
