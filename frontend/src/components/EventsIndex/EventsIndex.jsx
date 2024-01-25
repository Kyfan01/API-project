import { useDispatch, useSelector } from 'react-redux';
import './EventsIndex.css'
import { useEffect } from 'react';
import { fetchEventsThunk } from '../../store/event';
import { NavLink } from 'react-router-dom';
import EventPreviewCard from '../EventPreviewCard/EventPreviewCard';

export function EventsIndex() {

    const dispatch = useDispatch()
    const eventsObj = useSelector(state => state.events)
    const events = Object.values(eventsObj)

    useEffect(() => {
        dispatch(fetchEventsThunk())
    }, [dispatch])

    return (
        <div>
            <div className='index-header-container'>
                <NavLink to="/events" id='event-index-event-header'>Events</NavLink>
                <NavLink to="/groups" id='event-index-group-header'>Groups</NavLink>
            </div>
            <h1>Events in Ballr</h1>

            <div>
                <ul className='event-index-cards-container'>
                    {events?.map(event => <EventPreviewCard event={event} key={event.id} />)}
                </ul>
            </div>

        </div>
    )
}

export default EventsIndex;
