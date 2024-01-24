import { useDispatch, useSelector } from 'react-redux';
import './EventDetailsPage.css'
import { useParams, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchEventDetailsThunk } from '../../store/event';
import defaultPreviewImage from '../../../../images/def-preview-img.png'
import { formatDate } from '../../../utils/format';

export function EventDetailsPage() {
    const { eventId } = useParams()

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchEventDetailsThunk(eventId))
    }, [dispatch, eventId])


    const event = useSelector(state => state.events[eventId])

    let eventImage = event?.EventImages?.find(image => image.preview === true)
    const eventImageUrl = eventImage ? eventImage.url : defaultPreviewImage

    let startDate, startTime, endDate, endTime
    if (event) {
        [startDate, startTime] = formatDate(event?.startDate);
        [endDate, endTime] = formatDate(event?.endDate)
    }



    return (
        <div className='event-details-page'>
            <NavLink to='/events'>{'< Events'}</NavLink>
            <div className='event-details-upper-container'>

                <h1>{event?.name}</h1>
                <p>Hosted by FIND WHAT A HOST OF EVENT IS</p>
                <div className='event-details-img-container'>
                    <img className='event-details-event-image' src={eventImageUrl} alt="Image of the event" />
                </div>

                <div>
                    <div className='event-details-group-preview-container'>
                    </div>

                    <div className='event-details-event-info container'>
                        <p>{startDate} · {startTime}</p>
                        <p>{endDate} · {endTime}</p>

                        <p>$ SYMBOL HERE {event?.price}</p>
                        <p>LOCATION SYMBOL HERE {event?.type}</p>
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
