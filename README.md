# use-infinite-scroll-hook
A reusable hook to create infinite scroll list using Intersection Observer API

```javascript
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function useInfiniteScroll({ loading, getReceipts, hasNextPage, root = null, rootMargin = '100px'}) {
  const [page, setPage] = useState(0);
  const ref = useRef(null);

  const loadMore = useCallback(([target] = []) => {
    if (target.isIntersecting) {
      if (!loading && hasNextPage) {
        getReceipts(page);
        setPage(page + 1);
      }
    }
  }, [loading, hasNextPage, getReceipts, page]);

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
```

## Usage

```javascript
import React, {
  useState,
  useEffect,
  useCallback,
  useRef
}  from 'react';

function List({ filters }) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const getReceipts = useCallback(async(page = 0) => {
    try {
      setLoading(true);
      
      const data = await API.getReceipts(filters, page);

      if (!data.length) {
        setHasNextPage(false);
        
        return;
      }

      if (prevFilters !== filters || !page) {
        setRecords(data);
      } else {
        setRecords([ ...records, ...data]);
      }

      setHasNextPage(true);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [filters, records]);

  const loaderRef = useInfiniteScroll({
    loading,
    getReceipts,
    hasNextPage,
    root: document.querySelector('.weekly-tips-list__container')
  });

  useEffect(() => {
    // During first render
    if (!prevFilters && !filters) {
      return;
    }

    // // Reset data for newest incoming filters
    if (prevFilters !== filters) {
      setRecords([]);

      getReceipts();
    }
  }, [filters, getReceipts, prevFilters]);

  return (
    <div className="weekly-tips-list">
      <Paper className="weekly-tips-list__container">
        {
          records.map((record, index) => (
            <div key={index}>
              <p>record-{index}</p>
            </div>
          ))
        }

        <div ref={loaderRef} >
          <Loading fullWidth containerStyle={{lineHeight: `100px`}} />
        </div>
      </Paper>
    </div>
  );
}

export default List;

```

