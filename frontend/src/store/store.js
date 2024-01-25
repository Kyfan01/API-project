import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import groupReducer from './group';
import eventReducer from './event';
import currGroupReducer from './currGroup';
import currEventReducer from './currEvent';


const rootReducer = combineReducers({
  session: sessionReducer,
  groups: groupReducer,
  events: eventReducer,
  currGroup: currGroupReducer,
  currEvent: currEventReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
