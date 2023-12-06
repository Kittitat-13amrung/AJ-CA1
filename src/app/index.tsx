import { Link } from 'expo-router';
import { Text, Button } from 'react-native';
import LoginForm from '../components/LoginForm';
import { useSession } from '../contexts/AuthContext';

export default function Page() {
    const {session} = useSession();


    return (
        <>
            <Text>Home page</Text>

            {(!session) ? (
                <LoginForm />
            ) : (
                <>
                    <Link href={'/festivals/'} asChild>
                        <Button title='All Festivals' />
                    </Link>
                    <Text>You are logged in</Text>
                </>
            )}

        </>
    );
}