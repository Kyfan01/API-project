import { csrfFetch } from './csrf'

// action types
export const LOAD_GROUPS = 'groups/loadGroups'
export const LOAD_GROUP_DETAILS = 'groups/loadGroupDetails'


// action creators
export const loadGroups = groups => ({
    type: LOAD_GROUPS,
    payload: groups
})

export const loadGroupDetails = group => ({
    type: LOAD_GROUP_DETAILS,
    payload: group
})

// thunk action creators
export const fetchGroupsThunk = () => async dispatch => {
    try {
        const res = await csrfFetch('/api/groups')
        const groups = await res.json()
        dispatch(loadGroups(groups))
    } catch {
        return 'groups thunk error to be refactored'
    }
}

export const fetchGroupDetailsThunk = (groupId) => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}`)
        const group = await res.json()
        dispatch(loadGroupDetails(group))
    } catch {
        return 'group detail thunk error to be refactored'
    }
}


const groupReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_GROUPS: {
            const newGroupState = { ...state }
            action.payload.Groups.forEach(group => {
                newGroupState[group.id] = group
            })
            return newGroupState
        }
        case LOAD_GROUP_DETAILS: {
            const newGroupState = { ...state }
            newGroupState[action.payload.id] = { ...state[action.payload.id], ...action.payload }
            return newGroupState
        }

        default:
            return state;
    }
}

export default groupReducer;
