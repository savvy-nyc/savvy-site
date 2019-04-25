import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import {
  createResponsiveStateReducer,
  createResponsiveStoreEnhancer
} from "redux-responsive";
import { reducer as responsiveReducer } from "react-responsive-redux";
import { reducer as formReducer } from "redux-form";
import {
  routerReducer,
  createRouterMiddleware,
  initialRouterState
} from "connected-next-router";
import { Router } from "../routes";

const logger = createLogger({
  collapsed: true,
  diff: false
});

const routerMiddleware = createRouterMiddleware({
  Router,
  methods: {
    push: "pushRoute",
    replace: "replaceRoute",
    prefetch: "prefetchRoute"
  }
});

let middleware = [routerMiddleware, thunkMiddleware, logger];

export function initializeStore(initialState = {}, options = {}) {
  if (options.asPath) {
    initialState.router = initialRouterState(options.asPath);
  }
  return createStore(
    combineReducers({
      responsive: responsiveReducer,
      form: formReducer,
      browser: createResponsiveStateReducer(
        {
          desktopSiteWidth: 1249
        },
        {
          extraFields: ({ greaterThan }) => ({
            mobile: !greaterThan.desktopSiteWidth,
            desktop: greaterThan.desktopSiteWidth
          })
        }
      ),
      router: routerReducer
    }),
    initialState,
    composeWithDevTools(
      createResponsiveStoreEnhancer({ calculateInitialState: false }),
      applyMiddleware(...middleware)
    )
  );
}
