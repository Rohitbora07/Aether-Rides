'use client'
import { USER_ROUTE } from '@/constants/routes'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function useGetMe(enabled: boolean) {
    const dispatch = useDispatch()
    
    useEffect(() => {
        if(!enabled) return;
        const getData = async () => {
            const { data } = await axios.get(USER_ROUTE)
            // console.log(data)
            dispatch(setUserData(data))
        }
        getData()
    }, [enabled, dispatch])
}

export default useGetMe
