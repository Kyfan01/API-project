import defaultPreviewImage from '../../../../images/def-preview-img.png'
import './GroupsIndexCard.css'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchGroupEventsThunk } from '../../store/event'

export function GroupsIndexCard({ group }) {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchGroupEventsThunk(group.id))
    }, [dispatch, group])

    const allEventsObj = useSelector(state => state.events)
    const groupEventsArr = Object.values(allEventsObj).filter(event => event.groupId === parseInt(group.id))
    const eventCounter = groupEventsArr.length === 1 ? `1 Event` : `${groupEventsArr.length} Events`

    const privateStatus = group.private ? "Private" : "Public"
    const previewImage = group?.previewImage === 'default preview image url' ? defaultPreviewImage : group.previewImage
    const groupDetailsLink = `/groups/${group.id}`


    return (
        <Link to={groupDetailsLink} className='group-page-group-card-link'>
            <div className="group-page-group-card" title={group?.name}>
                <img className="group-page-preview-image" src={previewImage} alt="Group preview image" />

                <div className='group-page-group-card-info'>

                    <h2 className='group-page-group-card-name'>{group?.name}</h2>
                    <h4 className='group-page-group-card-location'>{group?.city}, {group?.state}</h4>
                    <p className='group-page-group-card-description'>{group?.about}</p>
                    <p className="group-page-group-card-event-info">{eventCounter} · {privateStatus}</p>
                </div>
            </div>
        </Link>
    )

}


export default GroupsIndexCard;
