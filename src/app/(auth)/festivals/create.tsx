import React from 'react';
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Text, StyleSheet, TextInput, NativeSyntheticEvent, TextInputChangeEventData, Button } from "react-native"
import { useEffect, useState } from 'react';
import { useSession } from "../../../contexts/AuthContext";
import { Festival } from '../../../types';

export default function Page() {
  const { id } = useLocalSearchParams();
  const [errors, setErrors] = useState("");

  const { session, isLoading } = useSession();

  const [form, setForm] = React.useState<Festival>({
    _id: "",
    title: "",
    description: "",
    city: "",
    end_date: new Date(),
    start_date: new Date()
  });

  const handleInputChange = (event: NativeSyntheticEvent<TextInputChangeEventData>, title: string) => {
    setForm(prevState => ({
      ...prevState,
      [title]: event.nativeEvent.text
    }));
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href={'/'} />
  }

  const handleSubmit = () => {
    console.log(form)

    fetch(`https://festivals-api.vercel.app/api/festivals/create`, {
        method: 'POST',
        body: JSON.stringify(form),
        headers: {
            'Content-Type': 'application/json'
        }

    })
    .then(async(data) => {
        const response = await data.json();

        if(data.ok) {
            return response;
        }

        throw response
    })
    .then(res => {
      console.log(res)
      router.push(`/festivals/${id}` as any);

    })
    .catch(err => {
        console.error(err)

        setErrors(err.message);
    })
};


  return (
    <>
      <TextInput
        id={'title'}
        style={styles.input}
        placeholder='title'
        value={form?.title}
        onChange={(e) => handleInputChange(e, "title")}
      />

      <TextInput
        id={'description'}
        style={styles.input}
        placeholder='description'
        value={form?.description}
        onChange={(e) => handleInputChange(e, "description")}
      />

      <TextInput
        id={'city'}
        style={styles.input}
        placeholder='city'
        value={form?.city}
        onChange={(e) => handleInputChange(e, "city")}
      />

      <TextInput
        id={'start_date'}
        style={styles.input}
        placeholder='start date'
        value={form?.start_date}
        onChange={(e) => handleInputChange(e, "start_date")}
      />

      <TextInput
        id={'end_date'}
        style={styles.input}
        placeholder='end date'
        value={form?.end_date}
        onChange={(e) => handleInputChange(e, "end_date")}
      />

      <Text>{errors}</Text>

      <Button
        onPress={handleSubmit}
        title="Submit"
        color="#841584"
        accessibilityLabel="Submit form"
      />
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});