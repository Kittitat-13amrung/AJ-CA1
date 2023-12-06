import { Text } from "react-native"
import { Link } from "expo-router"
import { useEffect, useState } from "react"
import { FlatList } from "react-native-gesture-handler";
import Item from "../../../components/Item";

interface Festival {
    _id: string,
    title: string,
    description: string,
    city: string,
    start_date: Date,
    end_date: Date,
    createdAt: Date,
    updatedAt: Date,
}

export default function Page() {
    const [festivals, setFestivals] = useState<Festival[]>([]);

    useEffect(() => {
        fetch('https://festivals-api.vercel.app/api/festivals', {
            method: 'GET'
        })
        .then(data => data.json())
        .then(data => {
            console.log(data)
            setFestivals(data);
        })
        .catch(err => {
            console.error(err);
        })
    }, []);

    const handleDeleteButton = (festivalId:string) => {
        const remainingFestivals = festivals.filter(festival => festival._id !== festivalId);

        setFestivals(remainingFestivals);
    };

    return (
        <>
            <Text>This is the view all festivals page</Text>

            <FlatList
            data={festivals}
            renderItem={({item}) =>
                <Item _id={item._id} title={item.title} city={item.city} onDelete={handleDeleteButton}/>
            }   
            keyExtractor={item => item._id}
            ItemSeparatorComponent={() => <Text>--------------------------</Text>}
            />

        </>
    )
}