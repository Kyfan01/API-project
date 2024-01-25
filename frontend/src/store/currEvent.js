import { csrfFetch } from './csrf'

// action types
export const LOAD_EVENT_DETAILS = 'events/loadEventDetails'

// action creators
export const loadEventDetails = event => ({
    type: LOAD_EVENT_DETAILS,
    payload: event
})

// thunk action creators

export const fetchEventDetailsThunk = eventId => async dispatch => {
    try {
        const res = await csrfFetch(`/api/events/${eventId}`)
        const event = await res.json()
        dispatch(loadEventDetails(event))
    } catch {
        return 'event details thunk error to be refactored'
    }
}

const currEventReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_EVENT_DETAILS: {
            const newCurrEventState = action.payload
            return newCurrEventState
        }
        default:
            return state;
    }
}

export default currEventReducer;
