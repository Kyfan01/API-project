import { useDispatch, useSelector } from 'react-redux';
import './GroupDetailsPage.css'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchGroupDetailsThunk } from '../../store/group';
import { NavLink } from 'react-router-dom';
import defaultPreviewImage from '../../../../images/def-preview-img.png'
import { fetchGroupEventsThunk } from '../../store/event';

export function GroupDetailsPage() {
    const { groupId } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(groupId))
        dispatch(fetchGroupEventsThunk(groupId))
    }, [dispatch, groupId])

    const group = useSelector(state => state.groups[groupId])
    const privateStatus = group?.private ? "Private" : "Public"

    const allEventsObj = useSelector(state => state.events)

    if (!group || !allEventsObj) return null

    const groupEventsArr = Object.values(allEventsObj).filter(event => event.groupId === parseInt(groupId))
    const eventCounter = groupEventsArr.length === 1 ? `1 Event` : `${groupEventsArr.length} Events`

    let groupImage = group.GroupImages?.find(image => image.preview === true)
    const groupImageUrl = groupImage ? groupImage.url : defaultPreviewImage

    const eventList = groupEventsArr.map(event => <p key={event.id} >{event.name}</p>)

    return (
        <div className='group-details-page'>
            <NavLink to='/groups'>{'< Groups'}</NavLink>
            <img className='group-details-group-image' src={groupImageUrl} alt="Image of the group" />
            <h1>{group?.name}</h1>
            <h2>{group?.city}, {group?.state}</h2>
            <p>{eventCounter} · {privateStatus}</p>
            <p>Organizer: {group?.Organizer?.firstName} {group?.Organizer?.lastName}</p>
            <p>{`What we're about: ${group?.about}`}</p>
            <p>{eventList}</p>
        </div>
    )
}

export default GroupDetailsPage;
