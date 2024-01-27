import { useDispatch, useSelector } from 'react-redux';
import './GroupDetailsPage.css'
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchGroupDetailsThunk } from '../../store/currGroup';
import { NavLink } from 'react-router-dom';
import defaultPreviewImage from '../../../../images/def-preview-img.png'
import { fetchGroupEventsThunk } from '../../store/event';
import EventPreviewCard from '../EventPreviewCard/EventPreviewCard';
import DeleteGroupModal from '../DeleteGroupModal/DeleteGroupModal';
import OpenModalButton from '../OpenModalButton'

export function GroupDetailsPage() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const group = useSelector(state => state.currGroup)
    const user = useSelector(state => state.session.user)

    const isOrganizer = (parseInt(user?.id) === group?.organizerId)

    const hideJoinButton = !user || isOrganizer ? 'hidden' : ''
    const hideOrgButton = user && isOrganizer ? '' : 'hidden'

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(groupId))
        dispatch(fetchGroupEventsThunk(groupId))
    }, [dispatch, groupId])

    const privateStatus = group?.private ? "Private" : "Public"

    const eventsObj = useSelector(state => state.events)

    if (!group || !eventsObj) return null

    let groupImage = group.GroupImages?.find(image => image?.preview === true)
    const groupImageUrl = groupImage ? groupImage.url : defaultPreviewImage

    const groupEventsArr = Object.values(eventsObj).filter(event => event?.groupId === parseInt(groupId))
    const eventCounter = groupEventsArr.length === 1 ? `1 Event` : `${groupEventsArr.length} Events`

    //Sort all upcoming group events by closeness to date
    const upcomingEventsArr = groupEventsArr.filter(event => Date.parse(event?.startDate) > Date.now());
    upcomingEventsArr.sort((a, b) => (Date.parse(a.startDate) - Date.parse(b.startDate)))

    //Sort all past events by closeness to date
    const pastEventsArr = groupEventsArr.filter(event => Date.parse(event?.startDate) < Date.now())
    pastEventsArr.sort((a, b) => (Date.parse(b.startDate) - Date.parse(a.startDate)))

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
                    <button className={`group-details-join-group-button ${hideJoinButton}`} onClick={() => alert('Feature coming soon')}>Join this Group</button>
                    <div>
                        <button className={`group-details-create-event-button ${hideOrgButton}`} onClick={() => navigate(`/groups/${groupId}/events/new`)}>Create event</button>
                        <button className={`group-details-update-button ${hideOrgButton}`} onClick={() => navigate(`/groups/${groupId}/update`)}>Update</button>
                        <OpenModalButton className={`group-details-delete-button ${hideOrgButton}`} buttonText='Delete' modalComponent={<DeleteGroupModal group={group} />} />
                    </div>
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
                <div>
                    <h3>Upcoming Events ({upcomingEventsArr.length})</h3>
                    {upcomingEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                </div>
                <div>
                    <h3>Past Events ({pastEventsArr.length})</h3>
                    {pastEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                </div>
            </div>
        </div>
    )
}

export default GroupDetailsPage;
