import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  const isInvalidForm = () => {
    const isValid = email.length === 0
      || username.length < 4
      || password.length < 6
      || confirmPassword.length < 6
      || firstName.length === 0
      || lastName.length === 0

    return isValid
  }

  return (
    <div className='signup-modal-container'>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className='signup-modal-form'>
        <label className='signup-modal-input-container' >
          <input
            className='signup-modal-input'
            type="text"
            value={email}
            placeholder='Email'
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p>{errors.email}</p>}
        <label className='signup-modal-input-container'>
          <input
            className='signup-modal-input'
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label >
        {errors.username && <p>{errors.username}</p>}
        <label className='signup-modal-input-container'>
          <input
            className='signup-modal-input'
            type="text"
            value={firstName}
            placeholder='First Name'
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && <p>{errors.firstName}</p>}
        <label className='signup-modal-input-container'>
          <input
            className='signup-modal-input'
            type="text"
            value={lastName}
            placeholder='Last Name'
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p>{errors.lastName}</p>}
        <label className='signup-modal-input-container'>
          <input
            className='signup-modal-input'
            type="password"
            value={password}
            placeholder='Password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p>{errors.password}</p>}
        <label className='signup-modal-input-container'>
          <input
            className='signup-modal-input'
            type="password"
            value={confirmPassword}
            placeholder='Confirm Password'
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
        <div className='signup-modal-button-container'>
          <button className='signup-modal-button' type="submit" disabled={isInvalidForm()}>Sign Up</button>
        </div>
      </form >
    </div >
  );
}

export default SignupFormModal;
