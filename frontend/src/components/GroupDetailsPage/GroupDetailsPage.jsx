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
        window.scrollTo(0, 0);
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

    const showPast = pastEventsArr.length ? true : false

    return (
        <div className='group-details-page'>
            <NavLink className='group-details-breadcrumb' to='/groups'>{'< Groups'}</NavLink>
            <div className='group-details-upper-container'>

                <div className='group-details-img-container'>
                    <img className='group-details-group-image' src={groupImageUrl} alt="Image of the group" />
                </div>
                <div className='group-details-upper-info'>
                    <div className='group-details-info-block'>
                        <h1>{group?.name}</h1>
                        <p>{group?.city}, {group?.state}</p>
                        <p>{eventCounter}&nbsp; · &nbsp;{privateStatus}</p>
                        <p>Organized by: {group?.Organizer?.firstName} {group?.Organizer?.lastName}</p>
                    </div>
                    <div className='group-details-join-group-button-container'>
                        {hideJoinButton !== 'hidden' && <button onClick={() => alert('Feature coming soon')}>Join this Group</button>}

                    </div>
                    <div className='group-details-buttons'>
                        {isOrganizer && <button className={`group-details-create-event-button ${hideOrgButton}`} onClick={() => navigate(`/groups/${groupId}/events/new`)}>Create event</button>}
                        {isOrganizer && <button className={`group-details-update-button ${hideOrgButton}`} onClick={() => navigate(`/groups/${groupId}/update`)}>Update</button>}
                        {isOrganizer && <OpenModalButton className={`group-details-delete-button ${hideOrgButton}`} buttonText='Delete' modalComponent={<DeleteGroupModal group={group} />} />}
                    </div>
                </div>
            </div>

            <div className='group-details-lower-container'>
                <div>
                    <h2>Organizer</h2>
                    <p>{group?.Organizer?.firstName} {group?.Organizer?.lastName}</p>
                </div>
                <div>
                    <h2>{`What we're about:`}</h2>
                    <p>{group?.about}</p>
                </div>
            </div>
            <div className='group-details-events-container'>
                <div>
                    <h2>Upcoming Events ({upcomingEventsArr.length})</h2>
                    {upcomingEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                </div>
                <div>
                    {showPast && <h2>Past Events ({pastEventsArr.length})</h2>}
                    {showPast && pastEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                </div>
            </div>
        </div>
    )
}

export default GroupDetailsPage;
