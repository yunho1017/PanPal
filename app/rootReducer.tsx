import * as Redux from "redux";
import { AllActions } from "./actions";
import { connectRouter, RouterState } from "connected-react-router";
import reduceReducers from "reduce-reducers";
import { createLocation } from "history";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

export type ThunkResult<
  R = void,
  S = {},
  A extends Redux.AnyAction = Redux.AnyAction
> = ThunkAction<Promise<R>, IAppState & S, undefined, AllActions | A>;

export type AppDispatch<
  S = {},
  A extends Redux.AnyAction = Redux.AnyAction
> = ThunkDispatch<IAppState & S, undefined, AllActions | A>;

export interface IAppStore<S = {}, A extends Redux.AnyAction = Redux.AnyAction>
  extends Redux.Store<IAppState & S, AllActions | A> {
  dispatch: AppDispatch<S, A>;
}

export interface IAppState {
  router: RouterState;
}

export const initialState: IAppState = {
  router: {
    action: "POP",
    location: createLocation("/"),
  },
};

export const appReducers: Redux.ReducersMapObject<{}> = {};

export function createRootReducer<S, A extends Redux.AnyAction>(
  history: History,
  combineReducers: Redux.ReducersMapObject<S, A>,
) {
  const appReducers: Redux.ReducersMapObject<IAppState, AllActions> = {
    router: connectRouter(history),
  };
  const reducers = {
    ...Object.entries(appReducers).reduce((result, [name, reducer]) => {
      if (!combineReducers.hasOwnProperty(name)) {
        return {
          ...result,
          [name]: reducer,
        };
      }
      return reduceReducers(reducer, (combineReducers[
        name as keyof typeof combineReducers
      ] as unknown) as Redux.Reducer<
        Parameters<typeof reducer>[0],
        AllActions | A
      >);
    }, {}),
  };
  return Redux.combineReducers<IAppState & S, AllActions | A>(
    reducers as Redux.ReducersMapObject<IAppState & S, AllActions | A>,
  );
}
