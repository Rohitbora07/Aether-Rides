import { Suspense } from 'react'
import CheckOutContent from '@/components/CheckOutContent'

function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>} >
            <CheckOutContent />
        </Suspense>
    )
}

export default Page
