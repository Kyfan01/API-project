import './DeleteEventModal.css'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCurrEvent } from '../../store/currEvent';
import { useModal } from '../../context/Modal';
import { deleteEventThunk } from '../../store/event';

export function DeleteEventModal({ event }) {
    const { closeModal } = useModal();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleDelete = async (e) => {
        e.preventDefault()
        dispatch(deleteEventThunk(event.id))
            .then(() => {
                dispatch(clearCurrEvent()) //removes event from currGroup state
                closeModal()
                navigate(`/groups/${event.groupId}`)
            })
    }

    const handleCancel = (e) => {
        e.preventDefault()
        closeModal()
    }

    return (
        <div>
            <h1>Confirm Delete</h1>
            <p>Are you sure you want to remove this event?</p>
            <button onClick={handleDelete}>Yes (Delete Event)</button>
            <button onClick={handleCancel}>No (Keep Event)</button>
        </div>
    )
}

export default DeleteEventModal;
