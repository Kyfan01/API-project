import { useDispatch, useSelector } from 'react-redux';
import './EventsIndex.css'
import { useEffect } from 'react';
import { fetchEventsThunk } from '../../store/event';
import { NavLink } from 'react-router-dom';
import EventPreviewCard from '../EventPreviewCard/EventPreviewCard';

export function EventsIndex() {

    const dispatch = useDispatch()
    const eventsObj = useSelector(state => state.events)
    const eventsArr = Object.values(eventsObj)

    useEffect(() => {
        dispatch(fetchEventsThunk())
    }, [dispatch, eventsArr.length])


    const upcomingEventsArr = eventsArr.filter(event => Date.parse(event.startDate) > Date.now());
    upcomingEventsArr.sort((a, b) => (Date.parse(a.startDate) - Date.parse(b.startDate)))


    const pastEventsArr = eventsArr.filter(event => Date.parse(event.startDate) < Date.now())
    pastEventsArr.sort((a, b) => (Date.parse(b.startDate) - Date.parse(a.startDate)))

    return (
        <div>
            <div className='index-header-container'>
                <NavLink to="/events" id='event-index-event-header'>Events</NavLink>
                <NavLink to="/groups" id='event-index-group-header'>Groups</NavLink>
            </div>
            <div className='events-index-container'>
                <h1>Events in Ballr</h1>
                <div>
                    <div className='event-index-card-container'>
                        <div>
                            <h2>Upcoming Events ({upcomingEventsArr.length})</h2>
                            {upcomingEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                        </div>
                        <div>
                            <h2>Past Events ({pastEventsArr.length})</h2>
                            {pastEventsArr.map(event => <EventPreviewCard key={event.id} event={event} />)}
                        </div>
                    </div>
                </div>

            </div>


        </div>
    )
}

export default EventsIndex;
