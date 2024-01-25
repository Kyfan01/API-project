import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';
import LogoButton from '../LogoButton';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  const hideCreateGroup = sessionUser ? "" : "hidden"

  return (
    <div className="navbar">
      <LogoButton />
      <ul className="nav-buttons">
        <li>
          <NavLink to="/groups/new" className={hideCreateGroup}>Start a new group</NavLink>
        </li>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        {isLoaded && (
          <li>
            <ProfileButton className="profile-button" user={sessionUser} />
          </li>
        )}
      </ul>
    </div>
  );
}

export default Navigation;
