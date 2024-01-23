import { useEffect } from 'react';
import './GroupsIndex.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupsThunk } from '../../store/groups';
import { NavLink } from 'react-router-dom';

export function GroupIndex() {

    const dispatch = useDispatch()
    const groupsObj = useSelector(state => state.groups)
    const groups = Object.values(groupsObj)

    useEffect(() => {
        dispatch(fetchGroupsThunk())
    }, [dispatch])

    return (
        <div>
            <div className='group-index-header-container'>
                <NavLink to="/events" id='group-index-event-header'>Events</NavLink>
                <NavLink to="/groups" id='group-index-group-header'>Groups</NavLink>
            </div>
            <h1>Groups in Ballr</h1>

            <div>
                <ul>
                    {groups.map(group => group.name)}
                </ul>
            </div>

        </div>
    )
}

export default GroupIndex;
