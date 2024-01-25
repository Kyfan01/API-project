import './EventPreviewCard.css'
import { Link } from 'react-router-dom';
import defaultPreviewImage from '../../../../images/def-preview-img.png'

export function EventPreviewCard({ event }) {

    const previewImage = event?.previewImage === 'default preview image url' ? defaultPreviewImage : event.previewImage

    const eventLocation = event?.Venue ? `${event.Venue.city}, ${event.Venue.state}` : 'Location TBD'

    // let startDate, startTime
    // if (event) [startDate, startTime] = formatDate(event?.startDate)

    const startDate = event.startDate?.substring(0, 10)
    const startTime = event.startDate?.substring(11, 16)

    return (
        <Link to={`/events/${event.id}`} className='event-preview-card-link'>
            <div className="event-preview-card">
                <div className='event-preview-card-upper'>

                    <img className="event-preview-card-image" src={previewImage} alt="Event preview image" />
                    <div className='event-preview-card-info'>
                        <p className='event-preview-card-start-time'>{startDate} · {startTime}</p>
                        <h2 className='event-preview-card-name'>{event?.name}</h2>
                        <h4 className='event-preview-card-location'>{eventLocation}</h4>
                    </div>
                </div>

                <div className='event-preview-card-lower'>
                    <p className='event-preview-card-description'>{event?.description}</p>
                </div>

            </div>
        </Link>
    )
}

export default EventPreviewCard;
