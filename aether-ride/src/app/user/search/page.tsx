import { Suspense } from 'react'
import SearchPage from '@/components/SearchPage'

function page() {
    return (
        <div>
            <Suspense fallback="Loading...">
                <SearchPage />
            </Suspense>
        </div>
    )
}

export default page

