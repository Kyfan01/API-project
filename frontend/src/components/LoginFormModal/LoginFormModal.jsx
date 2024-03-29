import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();


  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      })
      ;
  };

  const isInvalidForm = () => {
    const isValid = credential.length < 4
      || password.length < 6

    return isValid
  }

  return (
    <div className='login-modal-container'>
      <h1>Log In</h1>

      <form onSubmit={handleSubmit} className='login-modal-form'>
        <label className='login-modal-input-container'>
          <input
            className='login-modal-input'
            placeholder='Username or Email'
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label className='login-modal-input-container'>
          <input
            className='login-modal-input'
            placeholder='Password'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <button className='login-modal-button' type="submit" disabled={isInvalidForm()}>Log In</button>

        <button className='login-modal-button'
          onClick={() => {
            setCredential('geekfreak@user.io')
            setPassword('basketball')
          }}>Log In as Demo User</button>
      </form>
    </div>
  );
}

export default LoginFormModal;
