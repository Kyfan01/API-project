import { csrfFetch } from './csrf'

// action types
export const LOAD_GROUPS = 'groups/loadGroups'
// export const LOAD_GROUP_DETAILS = 'groups/loadGroupDetails'
export const CREATE_GROUP = 'groups/createGroup'
export const DELETE_GROUP = 'group/deleteGroup'


// action creators
export const loadGroups = groups => ({
    type: LOAD_GROUPS,
    payload: groups
})

// export const loadGroupDetails = group => ({
//     type: LOAD_GROUP_DETAILS,
//     payload: group
// })

export const createGroup = group => ({
    type: CREATE_GROUP,
    payload: group
})

export const deleteGroup = groupId => ({
    type: DELETE_GROUP,
    payload: groupId
})


// thunk action creators
export const fetchGroupsThunk = () => async dispatch => {
    try {
        const res = await csrfFetch('/api/groups')
        if (res.ok) {
            const groups = await res.json()
            dispatch(loadGroups(groups))
        }
    } catch {
        return 'groups thunk error to be refactored'
    }
}

// export const fetchGroupDetailsThunk = (groupId) => async dispatch => {
//     try {
//         const res = await csrfFetch(`/api/groups/${groupId}`)
//         const group = await res.json()
//         dispatch(loadGroupDetails(group))
//     } catch {
//         return 'group detail thunk error to be refactored'
//     }
// }

export const createGroupThunk = (group) => async dispatch => {
    try {
        const res = await csrfFetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        })

        if (res.ok) {
            const group = await res.json()
            dispatch(createGroup(group))
            return group
        }
    } catch {
        return 'groups thunk error to be refactored'
    }
}

export const deleteGroupThunk = groupId => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (res.ok) {
            const deleteConfirm = await res.json()
            dispatch(deleteGroup(groupId))
            return deleteConfirm
        }
    } catch {
        return 'delete group thunk needs to be refactored'
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
        // case LOAD_GROUP_DETAILS: {
        //     const newGroupState = { ...state }
        //     newGroupState[action.payload.id] = { ...state[action.payload.id], ...action.payload }
        //     return newGroupState
        // }
        case CREATE_GROUP: {
            const newGroupState = { ...state }
            newGroupState[action.payload.id] = action.payload
            return newGroupState
        }
        case DELETE_GROUP: {
            const newGroupState = { ...state }
            delete newGroupState[action.payload]
            return newGroupState
        }

        default:
            return state;
    }
}

export default groupReducer;
