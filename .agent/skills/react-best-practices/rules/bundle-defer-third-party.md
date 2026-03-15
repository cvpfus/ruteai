---
title: Defer Non-Critical Third-Party Libraries
impact: MEDIUM
impactDescription: loads after hydration
tags: bundle, third-party, analytics, defer
---

## Defer Non-Critical Third-Party Libraries

Analytics, logging, and error tracking don't block user interaction. Load them after hydration.

**Incorrect (blocks initial bundle):**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <div>
      <MainContent />
      <Analytics />
    </div>
  )
}
```

**Correct (loads after hydration):**

```tsx
import { lazy, Suspense, useEffect, useState } from 'react'

function App() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div>
      <MainContent />
      {isClient && (
        <Suspense fallback={null}>
          <LazyAnalytics />
        </Suspense>
      )}
    </div>
  )
}

const LazyAnalytics = lazy(() =>
  import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })),
)
```
