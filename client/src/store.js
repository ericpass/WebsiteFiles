import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
// Node uses default from index.js when importing from a directory without a specified file
import rootReducer from './reducers';

/* The rootReducer will pass an action through every reducer within the application, ensuring that the correct actions are applied and
produces a new, single state object.  Since the unused reducers return the current state, no additional data is used.*/

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
