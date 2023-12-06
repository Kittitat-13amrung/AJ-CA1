import React from 'react';
import {Button} from 'react-native';
import { useSession } from '../contexts/AuthContext';

interface Props {
    _id: string,
    resource: string,
    deleteCallbacks?: (_id:string) => void
}

const DeleteBtn:React.FC<Props> = ({_id, resource, deleteCallbacks}) => {
    const [deleting, setDeleting] = React.useState<boolean>(false);
    const {session} = useSession();

    const handleDeleteButton = async() => {
            setDeleting(true);

            try {
                const fetchData = await fetch(`https://festivals-api.vercel.app/api/${resource}/${_id}`, {
                    method: 'Delete',
                    headers: {
                        'Authorization': `Bearer ${session}`
                    }
                });

                const data = await fetchData.json();

                if(deleteCallbacks) {
                    // deleteCallbacks(prevState => )
                }

                console.log(data);
            } catch (err) {
                console.error(err);
            }
    };

    return <Button title={(deleting) ? 'Deleting' : 'Delete'} onPress={handleDeleteButton} color={'#ff000090'} />
}

export default DeleteBtn;