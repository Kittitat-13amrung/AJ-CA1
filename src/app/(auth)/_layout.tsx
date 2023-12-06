import { Redirect, Slot } from "expo-router";
import { Text } from "react-native";
import Footer from "../../components/Footer";

import { useSession } from "../../contexts/AuthContext";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
    const {isLoading, session} = useSession();

    if(isLoading) {
        return <Text>Loading...</Text>;
    }

    if(!session) {
        return <Redirect href={'/'} />
    }

    return (
        < Drawer >
            <Drawer.Screen
                name="index" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: "Home",
                    title: "overview",
                }}
            />

            <Drawer.Screen
                name="(auth)" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: "Festivals",
                    title: "Festivals",
                }}
            />
            <Footer />
        </Drawer >
    )
};