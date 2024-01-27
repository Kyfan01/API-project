import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import * as sessionActions from './store/session';
import LandingPage from './components/LandingPage/LandingPage';
import GroupsIndex from './components/GroupsIndex'
import GroupDetailsPage from './components/GroupDetailsPage';
import EventDetailsPage from './components/EventDetailsPage/EventDetailsPage';
import EventsIndex from './components/EventsIndex/EventsIndex';
import CreateGroupForm from './components/CreateGroupForm/CreateGroupForm';
import CreatEventForm from './components/CreateEventForm';

import { Modal } from './context/Modal'; //Keegan change
import UpdateGroupForm from './components/UpdateGroupForm/UpdateGroupForm';
import DeleteGroupModal from './components/DeleteGroupModal/DeleteGroupModal';


function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}


      <Modal />  {/* Keegan change */}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/groups',
        element: <GroupsIndex />
      },
      {
        path: '/groups/new',
        element: <CreateGroupForm />
      },
      {
        path: '/groups/:groupId',
        element: <GroupDetailsPage />
      },
      {
        path: '/groups/:groupId/update',
        element: <UpdateGroupForm />
      },
      {
        path: '/events',
        element: <EventsIndex />
      },
      {
        path: '/groups/:groupId/events/new',
        element: <CreatEventForm />
      },
      {
        path: '/events/:eventId',
        element: <EventDetailsPage />
      }
      // {
      //   path: 'login',
      //   element: <LoginFormPage />
      // },
      // {
      //   path: 'signup',
      //   element: <SignupFormPage />
      // }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
