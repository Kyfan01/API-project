import { csrfFetch } from './csrf'

// action types
export const LOAD_EVENTS = 'events/loadEvents'
export const LOAD_GROUP_EVENTS = 'groups/loadGroupEvents'

// action creators
export const loadEvents = events => ({
    type: LOAD_EVENTS,
    payload: events
})

export const loadGroupEvents = (groupId, events) => ({
    type: LOAD_GROUP_EVENTS,
    payload: { groupId, events }
})


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
        return events
    } catch {
        return 'group events thunk error to be refactored'
    }
}


const eventReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_EVENTS: {
            const newEventState = { ...state }
            action.payload.events.Events.forEach(event => {
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
        default:
            return state;
    }
}
export default eventReducer;
