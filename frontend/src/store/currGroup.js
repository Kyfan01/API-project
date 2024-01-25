import { csrfFetch } from './csrf'

// action types
export const LOAD_GROUP_DETAILS = 'groups/loadGroupDetails'

// action creators
export const loadGroupDetails = group => ({
    type: LOAD_GROUP_DETAILS,
    payload: group
})

// thunk action creators

export const fetchGroupDetailsThunk = groupId => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}`)
        const group = await res.json()
        dispatch(loadGroupDetails(group))
    } catch {
        return 'group detail thunk error to be refactored'
    }
}

const currGroupReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_GROUP_DETAILS: {
            const newCurrGroupState = action.payload
            return newCurrGroupState
        }
        default:
            return state;
    }
}


export default currGroupReducer;
