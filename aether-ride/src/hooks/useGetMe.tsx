'use client'
import { USER_ROUTE } from '@/constants/routes'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function useGetMe(enabled: boolean) {
    const dispatch = useDispatch()

    useEffect(() => {
        if (!enabled) return;
        let isMounted = true;
        const getData = async () => {
            try {
                const { data } = await axios.get(USER_ROUTE)
                if (isMounted && data?.user) {
                    dispatch(setUserData(data.user))
                }
            } catch (err) {
                console.error("Failed to fetch user session data:", err)
            }
        }
        getData()
        return () => { isMounted = false; }
    }, [enabled, dispatch])
}

export default useGetMe;
