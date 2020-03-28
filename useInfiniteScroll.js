import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function useInfiniteScroll({ loading, getData, hasNextPage, root = null, rootMargin = '100px'}) {
  const [page, setPage] = useState(0);
  const ref = useRef(null);

  const loadMore = useCallback(([target] = []) => {
    if (target.isIntersecting) {
      if (!loading && hasNextPage) {
        getData(page);
        setPage(page + 1);
      }
    }
  }, [loading, hasNextPage, getData, page]);

  useEffect(() => {
    const options = {
      root,
      rootMargin,
      threshold: 0.25
    };

    const observer = new IntersectionObserver(loadMore, options);

    if (ref && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    }
  }, [ref, loadMore, root, rootMargin]);

  return ref;
}
