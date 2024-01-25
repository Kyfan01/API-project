import { useDispatch, useSelector } from 'react-redux';
import './EventDetailsPage.css'
import { useParams, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchEventDetailsThunk } from '../../store/currEvent';
import defaultPreviewImage from '../../../../images/def-preview-img.png'

export function EventDetailsPage() {
    const { eventId } = useParams()
    const user = useSelector(state => state.session.user)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchEventDetailsThunk(eventId))
    }, [dispatch, eventId])


    const event = useSelector(state => state.currEvent)

    let eventImage = event?.EventImages?.find(image => image.preview === true)
    const eventImageUrl = eventImage ? eventImage.url : defaultPreviewImage

    const startDate = event.startDate?.substring(0, 10)
    const startTime = event.startDate?.substring(11, 16)

    const endDate = event.endDate?.substring(0, 10)
    const endTime = event.endDate?.substring(11, 16)

    const organizer = Object.values(event).length ? event?.Group?.Organizer : ''
    const isOrganizer = (parseInt(user?.id) === organizer?.id)
    const hideButton = user && isOrganizer ? '' : 'hidden'


    console.log(isOrganizer)

    return (
        <div className='event-details-page'>
            <NavLink to='/events'>{'< Events'}</NavLink>
            <div className='event-details-upper-container'>
                <div>
                    <h1>{event?.name}</h1>
                    <p>Hosted by {organizer?.firstName} {organizer?.lastName}</p>
                    <button className={`event-details-update-button ${hideButton}`} onClick={() => alert('Feature coming soon')}>Update</button>
                    <button className={`event-details-delete-button ${hideButton}`} onClick={() => alert('Feature coming soon')}>Delete</button>
                </div>
                <div className='event-details-img-container'>
                    <img className='event-details-event-image' src={eventImageUrl} alt="Image of the event" />
                </div>

                <div>
                    <div className='event-details-group-preview-container'>
                    </div>

                    <div className='event-details-event-info container'>
                        <div className='event-details-event-date'>
                            <img src="" alt="" />
                            <p>START</p>
                            <span> {startDate} · {startTime}</span>
                        </div>
                        <div className='event-details-event-date'>
                            <img src="" alt="" />
                            <p>END</p>
                            <span>{endDate} · {endTime} </span>
                        </div>
                        <div>
                            <p>$ SYMBOL HERE {event?.price}</p>

                        </div>

                        <div>
                            <p>LOCATION SYMBOL HERE {event?.type}</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className='event-details-lower-container'>
                <h2>Details</h2>
                <p>{event?.description}</p>
            </div>
        </div>
    )
}

export default EventDetailsPage;
