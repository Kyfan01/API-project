import { csrfFetch } from './csrf'

// action types
export const LOAD_GROUPS = 'groups/LOAD_GROUPS'

// action creators
export const loadGroups = groups => ({
    type: LOAD_GROUPS,
    payload: groups
})

// thunk action creators
export const fetchGroupsThunk = () => async dispatch => {
    const res = await csrfFetch('/api/groups')
    const groups = await res.json()
    dispatch(loadGroups(groups))
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

        default:
            return state;
    }
}

export default groupReducer;
