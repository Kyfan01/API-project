import { useDispatch } from 'react-redux';
import './CreateGroupForm.css'
import { useState } from 'react';

export function CreateGroupForm() {
    //const dispatch = useDispatch()
    const [city, setCity] = useState('')
    //const [state, setState] = useState('')
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [type, setType] = useState('')
    const [isPrivate, setIsPrivate] = useState('')
    const [imageUrl, setImageUrl] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(isPrivate)
    }



    return (
        <div>
            <h1>Start a New Group</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <h2>{"Set your group's location"}</h2>
                    <p>{"Ballr groups meet locally, in person, and online. We'll connect you with people in your area"}</p>
                    <label>
                        <input type="text" placeholder='City, STATE' value={city} onChange={e => setCity(e.target.value)} />
                    </label>
                </div>

                <div>
                    <h2>{"What will your group's name be?"}</h2>
                    <p>{"Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind."}</p>
                    <label>
                        <input type="text" placeholder='What is your group name' value={name} onChange={e => setName(e.target.value)} />
                    </label>
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
                        <textarea type="text" placeholder='Please write at least 30 characters' value={about} onChange={e => setAbout(e.target.value)} />
                    </label>
                </div>

                <div>
                    <div>
                        <h2>{"Is this an in-person or online group?"}</h2>
                        <select name="type" value={type} onChange={e => setType(e.target.value)}>
                            <option value="" disabled>(select one)</option>
                            <option value="In Person">In person</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>

                    <div>
                        <h2>{"Is this group private or public?"}</h2>
                        <select name="type" value={isPrivate} onChange={e => setIsPrivate(e.target.value)}>
                            <option value="" disabled>(select one)</option>
                            <option value={true}>Private</option>
                            <option value={false}>Public</option>
                        </select>
                    </div>
                    <div>

                        <p>{"Please add an image url for your group below:"}</p>
                        <input type="text" placeholder='Image Url' value={about} onChange={e => setAbout(e.target.value)} />
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
