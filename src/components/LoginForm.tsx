import React from 'react'

import { TextInput, Text, StyleSheet, Button, NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { useSession} from '../contexts/AuthContext';
import { authTypes, LoginFormTypes } from '../types';

const LoginForm: React.FC<LoginFormTypes> = ({ }) => {
    const {signIn} = useSession();

    const [form, setForm] = React.useState<LoginFormTypes | null>();
    const [errors, setErrors] = React.useState('');

    const handleInputChange = (event:NativeSyntheticEvent<TextInputChangeEventData>, title:string) => {
        setForm(prevState => ({
            ...prevState,
            [title]: event.nativeEvent.text
        }));
    }

    const handleSubmit = () => {
        console.log(form)

        fetch('https://festivals-api.vercel.app/api/users/login', {
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
            signIn(res.token);
            console.log(res.token)
        })
        .catch(err => {
            console.error(err)

            setErrors(err.message);
        })
    };

    return (
        <>
            <TextInput
                id={'email'}
                textContentType={'emailAddress'}
                autoComplete={'email'}
                style={styles.input}
                placeholder='email'
                value={form?.email}
                onChange={(e) => handleInputChange(e, "email")}
            />

            <TextInput
                id={'password'}
                secureTextEntry={true}
                textContentType={'password'}
                autoComplete={'password'}
                style={styles.input}
                placeholder='password'
                value={form?.password}
                onChange={(e) => handleInputChange(e, "password")}
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

export default LoginForm;