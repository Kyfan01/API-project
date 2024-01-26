import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './CreateEventForm.css'
import { useState, useEffect } from 'react';
import { fetchGroupDetailsThunk } from '../../store/currGroup';
import { createEventThunk } from '../../store/event';
import { createEventImageThunk } from '../../store/currEvent';

export function CreateEventForm() {
    const { groupId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(fetchGroupDetailsThunk(groupId))
    }, [dispatch, groupId])

    const group = useSelector(state => state.currGroup)

    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [isPrivate, setIsPrivate] = useState('')
    const [capacity, setCapacity] = useState('')
    const [price, setPrice] = useState('')
    let [startDate, setStartDate] = useState('')
    let [endDate, setEndDate] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [description, setDescription] = useState('')
    const [validationErr, setValidationErr] = useState({})


    const handleSubmit = async (e) => {
        e.preventDefault()

        setValidationErr({})
        const errObj = {}

        const okImageUrlEndings = ['jpg', 'jpeg', 'png']
        const imageUrlEnding = imageUrl.split('.').slice(-1)[0]


        if (!name) errObj.name = 'Name is required'
        if (type === "") errObj.type = "Group Type is required"
        if (isPrivate === "") errObj.private = "Visibility Type is required"
        if (!capacity) errObj.capacity = 'Capacity is required'
        if (capacity < 1) errObj.capacity = "Capacity must be a positive integer"
        if (!price) errObj.price = 'Price is required'
        if (!startDate) errObj.startDate = 'Start date is required'
        if (Date.parse(startDate) <= Date.parse(new Date())) errObj.startDate = "Event start time must be in the future"
        if (!endDate) errObj.endDate = 'End date is required'
        if (Date.parse(startDate) > Date.parse(endDate)) errObj.endDate = "Event start time must be after the event end time"
        if (imageUrl && !(okImageUrlEndings.includes(imageUrlEnding))) errObj.imageUrl = "Image URL needs to end in .jpg, .jpeg, or .png"
        if (!description) errObj.description = "Description is required"
        if (description.length < 30) errObj.description = "Description must be at least 30 characters long"

        // startDate = Date.parse(startDate)
        // endDate = Date.parse(endDate)


        if (Object.values(errObj).length) {
            setValidationErr(errObj)
        } else {
            const newEvent = {
                name,
                type,
                private: Boolean(isPrivate),
                capacity: parseInt(capacity),
                price: parseInt(price),
                startDate,
                endDate,
                imageUrl,
                description
            }


            dispatch(createEventThunk(groupId, newEvent))
                .then(resEvent => {
                    if (resEvent && imageUrl) {
                        const newEventImage = {
                            url: imageUrl,
                            preview: true
                        }
                        dispatch(createEventImageThunk(resEvent.id, newEventImage))
                        navigate(`/events/${resEvent.id}`)
                    } else {
                        navigate(`/events/${resEvent.id}`)
                    }
                })

        }
    }


    return (
        <div>
            <h1>{`Create a new event for ${group?.name}`}</h1>
            <form onSubmit={handleSubmit}>

                <div>
                    <h2>{"What is the name of your event?"}</h2>
                    <label>
                        <input type="text" placeholder='Event Name' value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <div>
                        {'name' in validationErr && (<span className='validation-error'>{validationErr.name}</span>)}
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
                        <h2>{"What is the price for your event?"}</h2>
                        <label>
                            <input type="text" placeholder='0' value={price} onChange={e => setPrice(e.target.value)} />
                        </label>
                        <div>
                            {'price' in validationErr && (<span className='validation-error'>{validationErr.price}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{"What is the capacity for your event?"}</h2>
                        <label>
                            <input type="text" placeholder='0' min={0} value={capacity} onChange={e => setCapacity(e.target.value)} />
                        </label>
                        <div>
                            {'capacity' in validationErr && (<span className='validation-error'>{validationErr.capacity}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{"When does your event start?"}</h2>
                        <label>
                            <input type="datetime-local" placeholder='MM/DD/YYYY, HH/mm AM' value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </label>
                        <div>
                            {'startDate' in validationErr && (<span className='validation-error'>{validationErr.startDate}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{"When does your event end?"}</h2>
                        <label>
                            <input type="datetime-local" placeholder='MM/DD/YYYY, HH/mm PM' value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </label>
                        <div>
                            {'endDate' in validationErr && (<span className='validation-error'>{validationErr.endDate}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{"Please add an image url for your event below:"}</h2>
                        <label htmlFor="">
                            <input type="text" placeholder='Image Url' value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                        </label>
                        <div>
                            {'imageUrl' in validationErr && (<span className='validation-error'>{validationErr.imageUrl}</span>)}
                        </div>
                    </div>

                    <div>
                        <h2>{'Please describe your event'}</h2>
                        <label >
                            <textarea type="text" placeholder='Please write at least 30 characters' value={description} onChange={e => setDescription(e.target.value)} />
                        </label>
                        <div>
                            {'description' in validationErr && (<span className='validation-error'>{validationErr.description}</span>)}
                        </div>
                    </div>

                </div>

                <div>
                    <button onSubmit={handleSubmit}>Create event</button>
                </div>
            </form>
        </div>
    )
}

export default CreateEventForm;
