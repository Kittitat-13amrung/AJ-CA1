import { Redirect, useLocalSearchParams } from "expo-router"
import { Text } from "react-native"
import {useEffect, useState} from 'react';
import { useSession } from "../../../../contexts/AuthContext";

export interface Festival {
    _id: string,
    title: string,
    city: string
}

export default function Page() {
    const {id} = useLocalSearchParams();
    const [festival, setFestival] = useState<Festival>();
    const [errors, setErrors] = useState("");

    const { session, isLoading } = useSession();

    if(isLoading) {
        return <Text>Loading...</Text>;
    }

    if(!session) {
        return <Redirect href={'/'} />
    }

    useEffect(() => {
        fetch(`https://festivals-api.vercel.app/api/festivals/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`
            }
        })
        .then(async(data) => {
            const res = await data.json()

            if(data.ok) {
                return res
            }

            throw res
        })
        .then(data => {
            console.log(data)
            setFestival(data);
        })
        .catch(err => {
            console.log(err)
            setErrors(err.message)
        })
    }, []);


    return (
        <>
            <Text>This is view festival page</Text>
            <Text>This page's id is {festival?.title}</Text>
            <Text>{errors}</Text>
        </>
    )
}