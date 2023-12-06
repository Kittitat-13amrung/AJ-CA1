import React from 'react';
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Text, StyleSheet, TextInput, NativeSyntheticEvent, TextInputChangeEventData, Button } from "react-native"
import { useEffect, useState } from 'react';
import { useSession } from "../../../../contexts/AuthContext";
import { Festival } from '../../../../types';

export default function Page() {
  const { id } = useLocalSearchParams();
  const [errors, setErrors] = useState("");

  const { session } = useSession();

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

  // if (isLoading) {
  //   return <Text>Loading...</Text>;
  // }

  if (!session) {
    return <Redirect href={'/'} />
  }

  // useEffect(() => {
  //   fetch(`https://festivals-api.vercel.app/api/festivals/${id}`, {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${session}`
  //     }
  //   })
  //     .then(async (data) => {
  //       const res = await data.json()

  //       if (data.ok) {
  //         return res
  //       }

  //       throw res
  //     })
  //     .then(data => {
  //       console.log(data)
  //       setFestival(data);
  //     })
  //     .catch(err => {
  //       console.log(err)
  //       setErrors(err.message)
  //     })
  // }, []);

  const handleSubmit = () => {
    console.log(form)

    fetch(`https://festivals-api.vercel.app/api/festivals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }

    })
      .then(async (data) => {
        const response = await data.json();

        if (data.ok) {
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
      <Text>Title:</Text>
      <TextInput
        id={'title'}
        style={styles.input}
        placeholder='Title'
        value={form?.title}
        onChange={(e) => handleInputChange(e, "title")}
      />

      <Text>Description:</Text>
      <TextInput
        id={'description'}
        style={styles.input}
        placeholder='Description'
        value={form?.description}
        onChange={(e) => handleInputChange(e, "description")}
      />

      <Text>City</Text>
      <TextInput
        id={'city'}
        style={styles.input}
        placeholder='City'
        value={form?.city}
        onChange={(e) => handleInputChange(e, "city")}
      />

      <Text>Start Date</Text>
      <TextInput
        id={'start_date'}
        style={styles.input}
        placeholder='Start Date'
        value={form?.start_date}
        onChange={(e) => handleInputChange(e, "start_date")}
      />

      <Text>End Date</Text>
      <TextInput
        id={'end_date'}
        style={styles.input}
        placeholder='End Date'
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