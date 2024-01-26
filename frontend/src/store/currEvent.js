import { csrfFetch } from './csrf'

// action types
export const LOAD_EVENT_DETAILS = 'events/loadEventDetails'
export const CREATE_EVENT_IMAGE = 'groups/createEventImage'

// action creators
export const loadEventDetails = event => ({
    type: LOAD_EVENT_DETAILS,
    payload: event
})

export const createEventImage = (image) => ({
    type: CREATE_EVENT_IMAGE,
    payload: image
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

export const createEventImageThunk = (eventId, image) => async dispatch => {
    try {
        const res = await csrfFetch(`/api/events/${eventId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(image)
        })

        if (res.ok) {
            const eventImageRes = await res.json()
            dispatch(createEventImage(image))
            return eventImageRes
        }

    } catch {
        return 'event images thunk needs to be refactored'
    }
}

const currEventReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_EVENT_DETAILS: {
            const newCurrEventState = action.payload
            return newCurrEventState
        }
        case CREATE_EVENT_IMAGE: {
            const newCurrEventState = { ...state }
            newCurrEventState.EventImages = [newCurrEventState.EventImages, action.payload.eventImage]
            return newCurrEventState
        }
        default:
            return state;
    }
}

export default currEventReducer;
