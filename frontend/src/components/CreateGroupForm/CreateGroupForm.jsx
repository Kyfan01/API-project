import { useDispatch } from 'react-redux';
import './CreateGroupForm.css'
import { useState } from 'react';
import { createGroupThunk } from '../../store/group';
import { useNavigate } from 'react-router-dom';
import { createGroupImageThunk } from '../../store/currGroup';

//TODO need to actually add image url to group
export function CreateGroupForm() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [cityState, setCityState] = useState('')
    // const [city, setCity] = useState('')
    // const [state, setState] = useState('test')
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [type, setType] = useState('')
    const [isPrivate, setIsPrivate] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [validationErr, setValidationErr] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault()
        let [city, state] = cityState.split(',')
        city = city?.trim()
        state = state?.trim()

        setValidationErr({})
        const errObj = {}

        const okImageUrlEndings = ['jpg', 'jpeg', 'png']
        const imageUrlEnding = imageUrl.split('.').slice(-1)[0]

        if (!city) errObj.city = 'City is required'
        if (!state) errObj.state = 'State is required (separated from city by comma)'
        if (!name) errObj.name = 'Name is required'
        if (name && name.length > 60) errObj.name = 'Name must be 60 characters or less'
        if (!about) errObj.about = "Description is required"
        if (about.length < 30) errObj.about = "Description must be at least 30 characters long"
        if (type === "") errObj.type = "Group Type is required"
        if (isPrivate === "") errObj.private = "Visibility Type is required"
        if (imageUrl && !(okImageUrlEndings.includes(imageUrlEnding))) errObj.imageUrl = "Image URL needs to end in .jpg, .jpeg, or .png"

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

            // dispatch thunk to create group in db. Then get the response from db and check if imageUrl was submitted.
            // if there is image url, use create group image thunk to store the image in the db, then navigate to new group details page.
            // if no image url, navigate to new group details page.
            dispatch(createGroupThunk(newGroup))
                .then(resGroup => {
                    if (resGroup && imageUrl) {
                        const newGroupImage = {
                            url: imageUrl,
                            preview: true
                        }
                        dispatch(createGroupImageThunk(resGroup.id, newGroupImage))
                        navigate(`/groups/${resGroup.id}`)
                    } else {
                        navigate(`/groups/${resGroup.id}`)
                    }
                })
        }
    }

    return (
        <div>
            <h1>Start a New Group</h1>
            <form onSubmit={handleSubmit}>
                <div>
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

                <div>
                    <h2>{"What will your group's name be?"}</h2>
                    <p>{"Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind."}</p>
                    <label>
                        <input type="text" placeholder='What is your group name' value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <div>
                        {'name' in validationErr && (<span className='validation-error'>{validationErr.name}</span>)}
                    </div>
                </div>

                <div>
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
                            <option value="" disabled>(select one)</option>
                            <option value="In person">In person</option>
                            <option value="Online">Online</option>
                        </select>
                        <div>
                            {'type' in validationErr && (<span className='validation-error'>{validationErr.type}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{"Is this group private or public?"}</h2>
                        <select name="isPrivate" value={isPrivate} onChange={e => setIsPrivate(e.target.value)}>
                            <option value="" disabled>(select one)</option>
                            <option value={true}>Private</option>
                            <option value={false}>Public</option>
                        </select>
                        <div>
                            {'private' in validationErr && (<span className='validation-error'>{validationErr.private}</span>)}
                        </div>
                    </div>
                    <div>

                        <h2>{"Please add an image url for your group below:"}</h2>
                        <label htmlFor="">
                            <input type="text" placeholder='Image Url' value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                        </label>
                        <div>
                            {'imageUrl' in validationErr && (<span className='validation-error'>{validationErr.imageUrl}</span>)}
                        </div>
                    </div>
                </div>
                <div>
                    <button onSubmit={handleSubmit}>Create group</button>
                </div>
            </form>
        </div>
    )
}

export default CreateGroupForm;
