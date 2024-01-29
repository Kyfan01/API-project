import './EventPreviewCard.css'
import { Link } from 'react-router-dom';
import defaultPreviewImage from '../../../../images/def-preview-img.png'

export function EventPreviewCard({ event }) {

    const previewImage = event?.previewImage === 'default preview image url' ? defaultPreviewImage : event.previewImage

    const eventLocation = event?.Venue ? `${event.Venue.city}, ${event.Venue.state}` : 'Location TBD'

    // let startDate, startTime
    // if (event) [startDate, startTime] = formatDate(event?.startDate)

    let startDate = event.startDate?.substring(0, 10)
    let startTime = event.startDate?.substring(11, 16)

    return (
        <div>
            <Link to={`/events/${event.id}`} className='event-preview-card-link'>
                <div className="event-preview-card" title={event?.name}>
                    <div className='event-preview-card-upper'>

                        <img className="event-preview-card-image" src={previewImage} alt="Event preview image" />
                        <div className='event-preview-card-info'>
                            <p className='event-preview-card-start-time'>{startDate} &nbsp; · &nbsp; {startTime}</p>
                            <h2 className='event-preview-card-name'>{event?.name}</h2>
                            <h4 className='event-preview-card-location'>{eventLocation}</h4>
                        </div>
                    </div>

                    <div className='event-preview-card-lower'>
                        <p className='event-preview-card-description'>{event?.description}</p>
                    </div>

                </div>
            </Link>
        </div>

    )
}

export default EventPreviewCard;
