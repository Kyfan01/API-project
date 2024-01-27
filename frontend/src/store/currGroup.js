import { csrfFetch } from './csrf'

// action types
export const LOAD_GROUP_DETAILS = 'groups/loadGroupDetails'
export const CREATE_GROUP_IMAGE = 'groups/createGroupImage'
export const UPDATE_GROUP = 'groups/updateGroup'
export const CLEAR_CURRENT_GROUP = 'groups/clearCurrentGroup'


// action creators
export const loadGroupDetails = group => ({
    type: LOAD_GROUP_DETAILS,
    payload: group
})

export const createGroupImage = (image) => ({
    type: CREATE_GROUP_IMAGE,
    payload: image
})

export const updateGroup = group => ({
    type: UPDATE_GROUP,
    payload: group
})

export const clearCurrGroup = () => ({
    type: CLEAR_CURRENT_GROUP
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

export const createGroupImageThunk = (groupId, image) => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(image)
        })

        if (res.ok) {
            const groupImageRes = await res.json()
            dispatch(createGroupImage(image))
            return groupImageRes
        }

    } catch {
        return 'group images thunk needs to be refactored'
    }
}

export const updateGroupThunk = (groupId, group) => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        })

        if (res.ok) {
            const updatedGroup = await res.json()
            dispatch(updateGroup(updatedGroup))
            return updatedGroup
        }
    } catch {
        return 'update group thunk needs to be refactored'
    }
}



const currGroupReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_GROUP_DETAILS: {
            const newCurrGroupState = action.payload
            return newCurrGroupState
        }
        case CREATE_GROUP_IMAGE: {
            const newCurrGroupState = { ...state }
            newCurrGroupState.GroupImages = [newCurrGroupState.GroupImages, action.payload.groupImage]
            return newCurrGroupState
        }
        case UPDATE_GROUP: {
            const newCurrGroupState = { ...state }
            newCurrGroupState[action.payload.id] = action.payload
            return newCurrGroupState
        }
        case CLEAR_CURRENT_GROUP: {
            return {}
        }
        default:
            return state;
    }
}


export default currGroupReducer;
