import { Link, router } from 'expo-router'
import React from 'react'
import { Text, View, Button } from 'react-native'
import DeleteBtn from './DeleteBtn'

export interface Props {
  _id: string,
  title: string,
  city: string,
  onDelete?: (_id:string) => void
}

const Item: React.FC<Props> = ({ title, city, _id, onDelete }) => {

return (
  <View>
    <Link
      href={`/festivals/${_id}` as any}
    >
      {title}
    </Link>
    <Text>{city}</Text>
    <Button title='Edit' onPress={() => router.push(`/festivals/${_id}/edit`)} />
    <DeleteBtn _id={_id} resource='festivals' deleteCallbacks={onDelete}/>
  </View>
)
}

export default Item;