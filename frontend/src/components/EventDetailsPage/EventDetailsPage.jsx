import { useDispatch, useSelector } from 'react-redux';
import './EventDetailsPage.css'
import { useParams, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchEventDetailsThunk } from '../../store/currEvent';
import defaultPreviewImage from '../../../../images/def-preview-img.png'
import OpenModalButton from '../OpenModalButton';
import DeleteEventModal from '../DeleteEventModal';
import { fetchGroupDetailsThunk } from '../../store/currGroup';

export function EventDetailsPage() {
    const { eventId } = useParams()
    const user = useSelector(state => state.session.user)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchEventDetailsThunk(eventId))
    }, [dispatch, eventId])


    const event = useSelector(state => state.currEvent)

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(event?.Group?.id))
    }, [dispatch, event])

    const group = useSelector(state => state.currGroup)
    let groupImage = group?.GroupImages?.find(image => image?.preview === true)
    const groupImageUrl = groupImage ? groupImage.url : defaultPreviewImage

    let eventImage = event?.EventImages?.find(image => image?.preview === true)
    const eventImageUrl = eventImage ? eventImage.url : defaultPreviewImage

    const startDate = event.startDate?.substring(0, 10)
    const startTime = event.startDate?.substring(11, 16)

    const endDate = event.endDate?.substring(0, 10)
    const endTime = event.endDate?.substring(11, 16)

    const organizer = Object.values(event).length ? event?.Group?.Organizer : ''
    const isOrganizer = (parseInt(user?.id) === organizer?.id)
    const hideButton = user && isOrganizer ? '' : 'hidden'

    return (
        <div className='event-details-page'>
            <div className='event-details-page-header'>
                <NavLink to='/events'>{'< Events'}</NavLink>
                <h1>{event?.name}</h1>
                <p>Hosted by {organizer?.firstName} {organizer?.lastName}</p>

            </div>
            <div className='event-details-upper-container'>
                <div className='event-details-img-container'>
                    <img className='event-details-event-image' src={eventImageUrl} alt="Image of the event" />
                </div>

                <div className='event-details-upper-right'>
                    <NavLink className='event-details-group-preview-link' to={`/groups/${group?.id}`}>
                        <div className='event-details-group-preview-container'>
                            <img className='event-details-group-preview-image' src={groupImageUrl} alt="Preview image of group" />
                            <div className='event-details-group-preview-info'>
                                <h2>{group.name}</h2>
                                <p>{group.private ? 'Private' : 'Public'}</p>
                            </div>
                        </div>
                    </NavLink>

                    <div className='event-details-event-info-container'>
                        <div className='event-details-event-date'>
                            <div>


                            </div>
                            <div className='event-details-start-end'>
                                <i className="fa-regular fa-clock"></i>
                                <p >
                                    START <br /> END
                                </p>
                                <p>{endDate} &nbsp; · &nbsp; {endTime} <br /> {startDate} &nbsp; · &nbsp; {startTime} </p>
                            </div>
                        </div>
                        <div className='event-details-price'>
                            <i className="fa-solid fa-circle-dollar-to-slot"></i>
                            <p>$ {event?.price === 0 ? 'FREE' : event?.price}</p>

                        </div>

                        <div className='event-details-type'>
                            <i className="fa-solid fa-location-crosshairs"></i>
                            <p>{event?.type}</p>
                        </div>
                        <div className='event-detail-button-container'>
                            <button className={`event-details-update-button ${hideButton}`} onClick={() => alert('Feature coming soon')}>Update</button>
                            {isOrganizer && <OpenModalButton className={`event-details-delete-button ${hideButton}`} buttonText='Delete' modalComponent={<DeleteEventModal event={event} />} />}
                        </div>
                    </div>

                </div>
            </div>

            <div className='event-details-lower-container'>
                <h2>Description</h2>
                <p>{event?.description}</p>
            </div>
        </div>
    )
}

export default EventDetailsPage;
