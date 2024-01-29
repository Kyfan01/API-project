import { useDispatch, useSelector } from 'react-redux';
import './UpdateGroupForm.css'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { fetchGroupDetailsThunk, updateGroupThunk } from '../../store/currGroup';

export function UpdateGroupForm() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { groupId } = useParams()

    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [cityState, setCityState] = useState('')
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [type, setType] = useState('')
    const [isPrivate, setIsPrivate] = useState('')
    const [validationErr, setValidationErr] = useState({})

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(groupId))
    }, [dispatch, groupId])

    const group = useSelector(state => state.currGroup)
    const user = useSelector(state => state.session.user)

    useEffect(() => {
        const isOrganizer = (parseInt(user?.id) === group?.organizerId)
        if (!isOrganizer) navigate('/')

        setCity(group?.city)
        setState(group?.state)
        setCityState(`${group?.city}, ${group?.state}`)
        setName(group?.name)
        setAbout(group?.about)
        setType(group?.type)
        setIsPrivate(group?.private)
    }, [group, navigate, user])

    const handleSubmit = async (e) => {
        e.preventDefault()

        setCity(cityState.split(',')[0]?.trim())
        setState(cityState.split(',')[1]?.trim())

        setValidationErr({})
        const errObj = {}

        if (!city) errObj.city = 'City is required'
        if (!state) errObj.state = 'State is required (separated from city by comma)'
        if (!name) errObj.name = 'Name is required'
        if (!about) errObj.about = "Description is required"
        if (about.length < 30) errObj.about = "Description must be at least 30 characters long"
        if (type === "") errObj.type = "Group Type is required"
        if (isPrivate === "") errObj.private = "Visibility Type is required"

        if (Object.values(errObj).length) {
            setValidationErr(errObj)
        } else {
            const newGroup = {
                city,
                state,
                name,
                about,
                type,
                private: Boolean(isPrivate),
            }

            dispatch(updateGroupThunk(groupId, newGroup))
                .then(resGroup => {
                    //console.log(resGroup)
                    navigate(`/groups/${resGroup.id}`)
                })
        }

    }

    return (
        <div className='update-group-page'>
            <h1>Update your Group</h1>
            <form onSubmit={handleSubmit}>
                <div className='update-group-input-section'>
                    <h2>{"Set your group's location"}</h2>
                    <p>{"Ballr groups meet locally, in person, and online. We'll connect you with people in your area"}</p>
                    <label>
                        <input type="text" placeholder='City, STATE' value={cityState} onChange={e => setCityState(e.target.value)} />
                    </label>

                    <div>
                        {'city' in validationErr && (<span className='validation-error'>{validationErr.city}</span>)}
                    </div>
                    <div>
                        {'state' in validationErr && (<span className='validation-error'>{validationErr.state}</span>)}
                    </div>
                </div>

                <div className='update-group-input-section'>
                    <h2>{"What will your group's name be?"}</h2>
                    <p>{"Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind."}</p>
                    <label>
                        {/* Somehow this is the only input that gives a warning for name being undefined and thus uncontrolled */}
                        <input type="text" placeholder='What is your group name' value={name || ''} onChange={e => setName(e.target.value)} />
                    </label>
                    <div>
                        {'name' in validationErr && (<span className='validation-error'>{validationErr.name}</span>)}
                    </div>
                </div>

                <div className='update-group-input-section'>
                    <h2>{"Describe the purpose of your group"}</h2>
                    <p>{"People will see this when we promote your group, but you'll be able to add to it later, too."}</p>
                    <ol>
                        <li>{"What's the purpose of the group?"}</li>
                        <li>{"Who should join?"}</li>
                        <li>{"What will you do at your events?"}</li>
                    </ol>
                    <label >
                        <textarea type="text" placeholder='Please write at least 50 characters' value={about} onChange={e => setAbout(e.target.value)} />
                    </label>
                    <div>
                        {'about' in validationErr && (<span className='validation-error'>{validationErr.about}</span>)}
                    </div>
                </div>

                <div>
                    <div>
                        <h2>{"Is this an in-person or online group?"}</h2>
                        <select name="type" value={type} onChange={e => setType(e.target.value)}>
                            <option value="In person">In person</option>
                            <option value="Online">Online</option>
                        </select>
                        <div>
                            {'type' in validationErr && (<span className='validation-error'>{validationErr.type}</span>)}
                        </div>
                    </div>

                    <div className='update-group-input-section'>
                        <h2>{"Is this group private or public?"}</h2>
                        <select name="isPrivate" value={isPrivate} onChange={e => setIsPrivate(e.target.value)}>
                            <option value={true}>Private</option>
                            <option value={false}>Public</option>
                        </select>
                        <div>
                            {'private' in validationErr && (<span className='validation-error'>{validationErr.private}</span>)}
                        </div>
                    </div>

                </div>
                <div className='update-group-button-container'>
                    <button onSubmit={handleSubmit}>Update Group</button>
                </div>
            </form>
        </div>
    )

}


export default UpdateGroupForm;
