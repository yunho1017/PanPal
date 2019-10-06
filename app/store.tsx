import { History } from "history";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionCreatorsMapObject,
  bindActionCreators,
  createStore,
  applyMiddleware,
  compose,
} from "redux";
import {
  IAppState,
  initialState as appInitialState,
  appReducers,
  createRootReducer,
  ThunkResult,
  AppDispatch,
  IAppStore,
} from "./rootReducer";
import { AllActions } from "./actions";
import logger from "redux-logger";
import { routerMiddleware } from "connected-react-router";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { isDev } from "common/helpers/envChecker";

export type ThunkResult<R = void> = ThunkResult<R, IAppState, AllActions>;
export type AppDispatch = AppDispatch<IAppState, AllActions>;
export interface IAppStore extends IAppStore<IAppState, AllActions> {}

function initialAppState() {
  try {
    return ((window as any).__INITIAL_STATE__ as IAppState) || undefined;
  } catch (err) {
    return appInitialState;
  }
}

export function createAppStore(history: History, initialState?: IAppState) {
  // create redux store from initial state
  const storeMiddlewares = [
    routerMiddleware(history),
    thunk as ThunkMiddleware<IAppState, AllActions>,
  ];

  if (isDev()) {
    storeMiddlewares.push(logger);
  }

  const composer = isDev() ? composeWithDevTools({}) : compose;
  const composeEnhancers = composer(applyMiddleware(...storeMiddlewares));
  const rootReducer = createRootReducer<IAppState, AllActions>(
    history,
    appReducers,
  );

  return createStore(
    rootReducer,
    initialState || initialAppState(),
    composeEnhancers,
  );
}

export function useActions<M extends ActionCreatorsMapObject<any>>(
  actions: M,
  deps: any[] = [],
) {
  const dispatch = useDispatch<AppDispatch>();
  return React.useMemo(
    () => {
      return bindActionCreators<M>(actions, dispatch);
    },
    deps ? [dispatch, ...deps] : deps,
  );
}

export function useStoreState<H extends object>(
  mapStateSelector: (state: IAppState) => H,
) {
  return useSelector(mapStateSelector);
}
