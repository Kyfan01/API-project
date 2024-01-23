import defaultPreviewImage from '../../../../images/def-preview-img.png'
import './GroupsIndexCard.css'
import { Link } from 'react-router-dom'

export function GroupsIndexCard({ group }) {

    const privateStatus = group.private ? "Private" : "Public"
    const previewImage = group.previewImage === 'default preview image url' ? defaultPreviewImage : group.previewImage
    const groupDetailsLink = `/groups/${group.id}`


    return (
        <Link to={groupDetailsLink} className='group-page-group-card-link'>
            <div className="group-page-group-card">
                <img className="group-page-preview-image" src={previewImage} alt="Group preview image" />

                <div className='group-page-group-card-info'>

                    <h2 className='group-page-group-card-name'>{group.name}</h2>
                    <h4 className='group-page-group-card-location'>{group.city}, {group.state}</h4>
                    <p className='group-page-group-card-description'>{group.about}</p>
                    <p className="group-page-group-card-event-info"> Events · {privateStatus}</p>
                </div>
            </div>
        </Link>
    )

}


export default GroupsIndexCard;
