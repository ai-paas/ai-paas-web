import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const STORAGE_KEY = 'aipaas.scopedCluster';

/**
 * 애플리케이션 화면들이 같이 쓰는 클러스터.
 *
 * <p>설치된 앱과 설치 폼이 각자 클러스터를 물으면 화면을 옮길 때마다 같은 것을 다시 고르게
 * 된다. URL 에 남겨 공유와 새로고침이 되게 하고, 값이 없으면 마지막에 쓴 것을 꺼낸다.
 */
export const useScopedCluster = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromUrl = searchParams.get('clusterId') ?? '';
  const [clusterName, setClusterNameState] = useState(
    () => fromUrl || window.sessionStorage.getItem(STORAGE_KEY) || ''
  );

  useEffect(() => {
    if (fromUrl && fromUrl !== clusterName) setClusterNameState(fromUrl);
  }, [fromUrl, clusterName]);

  const setClusterName = useCallback(
    (next: string) => {
      setClusterNameState(next);
      if (next) window.sessionStorage.setItem(STORAGE_KEY, next);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next) params.set('clusterId', next);
          else params.delete('clusterId');
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { clusterName, setClusterName };
};
