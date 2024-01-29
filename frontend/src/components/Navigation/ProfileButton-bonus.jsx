import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';
import { Link, useNavigate } from 'react-router-dom';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const navigate = useNavigate()

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/')
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button className='user-profile-button' onClick={toggleMenu}>
        <i className="fas fa-user-circle" />
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <div className="profile-dropdown-menu">
            <li className='profile-dropdown-item'>Hello, {user.firstName}</li>
            <li className='profile-dropdown-item'>{user.firstName} {user.lastName}</li>
            <li className='profile-dropdown-item'>{user.email}</li>
            <li className='profile-dropdown-item'><Link to='/groups'>View groups</Link></li>
            <li className='profile-dropdown-item'><Link to={'/events'}>View events</Link></li>
            <div className='profile-logout-button-container'>
              <button onClick={logout} className='profile-logout-button'>Log Out</button>
            </div>
          </div>
        ) : (
          <div className="profile-dropdown-menu" >
            <div className='profile-dropdown-guest-item'>
              <OpenModalMenuItem
                itemText="Log In"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </div>
            <div className='profile-dropdown-guest-item'>
              <OpenModalMenuItem
                className='profile-dropdown-guest-item'
                itemText="Sign Up"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
            </div>
          </div>
        )}
      </ul>
    </>
  );
}

export default ProfileButton;
