export interface authTypes {
    signIn: (token:string) => void,
    signOut: () => void,
    session?: string | null,
    isLoading: boolean
}

export interface LoginFormTypes extends React.HTMLProps<HTMLDivElement> {
    email?: string,
    password?: string,
    prevState?: null
}

export interface Festival {
    _id: string,
    title: string,
    description: string,
    city: string,
    start_date: date,
    end_date: date
}