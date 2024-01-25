import { useDispatch, useSelector } from 'react-redux';
import './GroupDetailsPage.css'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchGroupDetailsThunk } from '../../store/currGroup';
import { NavLink } from 'react-router-dom';
import defaultPreviewImage from '../../../../images/def-preview-img.png'
import { fetchGroupEventsThunk } from '../../store/event';
import EventPreviewCard from '../EventPreviewCard/EventPreviewCard';

export function GroupDetailsPage() {
    const { groupId } = useParams()
    const group = useSelector(state => state.currGroup)
    const user = useSelector(state => state.session.user)

    const isOrganizer = (parseInt(user?.id) === group?.organizerId)

    const hideButton = !user || isOrganizer ? 'hidden' : ''

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(groupId))
        dispatch(fetchGroupEventsThunk(groupId))
    }, [dispatch, groupId])

    const privateStatus = group?.private ? "Private" : "Public"

    const eventsObj = useSelector(state => state.events)

    if (!group || !eventsObj) return null

    const groupEventsArr = Object.values(eventsObj).filter(event => event.groupId === parseInt(groupId))
    const eventCounter = groupEventsArr.length === 1 ? `1 Event` : `${groupEventsArr.length} Events`

    let groupImage = group.GroupImages?.find(image => image.preview === true)
    const groupImageUrl = groupImage ? groupImage.url : defaultPreviewImage

    const eventList = groupEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)

    return (
        <div className='group-details-page'>
            <NavLink to='/groups'>{'< Groups'}</NavLink>
            <div className='group-details-upper-container'>
                <div className='group-details-img-container'>
                    <img className='group-details-group-image' src={groupImageUrl} alt="Image of the group" />
                </div>
                <div className='group-details-upper-info'>
                    <h1>{group?.name}</h1>
                    <p>{group?.city}, {group?.state}</p>
                    <p>{eventCounter} · {privateStatus}</p>
                    <p>Organized by: {group?.Organizer?.firstName} {group?.Organizer?.lastName}</p>
                    <button className={`group-details-join-group-button ${hideButton}`} onClick={() => alert('Feature coming soon')}>Join this Group</button>
                </div>
            </div>

            <div className='group-details-lower-container'>
                <div>
                    <h3>Organizer</h3>
                    <p>{group?.Organizer?.firstName} {group?.Organizer?.lastName}</p>
                </div>
                <div>
                    <h3>{`What we're about:`}</h3>
                    <p>{group?.about}</p>
                </div>
            </div>
            <div>
                <h3>Upcoming Events ({groupEventsArr.length})</h3>
                {eventList}

                <h3>Past Events ()</h3>
            </div>
        </div>
    )
}

export default GroupDetailsPage;
