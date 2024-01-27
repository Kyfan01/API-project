import './DeleteGroupModal.css'
import { useModal } from '../../context/Modal';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteGroupThunk } from '../../store/group';
import { clearCurrGroup } from '../../store/currGroup';
import { clearEventsState } from '../../store/event';

export function DeleteGroupModal({ group }) {
    const { closeModal } = useModal();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleDelete = async (e) => {
        e.preventDefault()
        dispatch(deleteGroupThunk(group.id))
            .then(() => {
                dispatch(clearCurrGroup()) //removes group from currGroup state
                dispatch(clearEventsState()) //clears the event state to trigger re-render of events, since events.length is in dependency array
                closeModal()
                navigate('/groups')
            })
    }

    const handleCancel = (e) => {
        e.preventDefault()
        closeModal()
    }

    return (
        <div>
            <h1>Confirm Delete</h1>
            <p>Are you sure you want to remove this group?</p>
            <button onClick={handleDelete}>Yes (Delete Group)</button>
            <button onClick={handleCancel}>No (Keep Group)</button>
        </div>
    )
}

export default DeleteGroupModal;
