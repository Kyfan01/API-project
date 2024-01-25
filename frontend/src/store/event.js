import { csrfFetch } from './csrf'

// action types
export const LOAD_EVENTS = 'events/loadEvents'
export const LOAD_GROUP_EVENTS = 'groups/loadGroupEvents'
// export const LOAD_EVENT_DETAILS = 'events/loadEventDetails'

// action creators
export const loadEvents = events => ({
    type: LOAD_EVENTS,
    payload: events
})

export const loadGroupEvents = (groupId, events) => ({
    type: LOAD_GROUP_EVENTS,
    payload: { groupId, events }
})

// export const loadEventDetails = eventId => ({
//     type: LOAD_EVENT_DETAILS,
//     payload: eventId
// })


// thunk action creators
export const fetchEventsThunk = () => async dispatch => {
    try {
        const res = await csrfFetch('/api/events')
        const events = await res.json()
        dispatch(loadEvents(events))
    } catch {
        return 'events thunk error to be refactored'
    }
}

export const fetchGroupEventsThunk = groupId => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}/events`)
        const events = await res.json()
        dispatch(loadGroupEvents(groupId, events))
    } catch {
        return 'group events thunk error to be refactored'
    }
}

// export const fetchEventDetailsThunk = eventId => async dispatch => {
//     try {
//         const res = await csrfFetch(`/api/events/${eventId}`)
//         const event = await res.json()
//         dispatch(loadEventDetails(event))
//     } catch {
//         return 'event details thunk error to be refactored'
//     }
// }

const eventReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_EVENTS: {
            const newEventState = { ...state }
            action.payload.Events.forEach(event => {
                newEventState[event.id] = event
            })
            return newEventState
        }
        case LOAD_GROUP_EVENTS: {
            const newEventState = { ...state }
            action.payload.events.Events.forEach(event => {
                newEventState[event.id] = event
            })
            return newEventState
        }
        // case LOAD_EVENT_DETAILS: {
        //     const newEventState = { ...state }
        //     newEventState[action.payload.id] = { ...state[action.payload.id], ...action.payload }
        //     return newEventState
        // }
        default:
            return state;
    }
}
export default eventReducer;
