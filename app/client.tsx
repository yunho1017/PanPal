import * as React from "react";
import * as ReactDom from "react-dom";
import { IAppStore, createAppStore } from "./store";
import { loadableReady } from "@loadable/component";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import { createBrowserHistory, History } from "history";
import {
  isServer,
  isTest,
  isServerSideRendering,
} from "common/helpers/envChecker";

export class ClientSideRenderer {
  private readonly history: History = createBrowserHistory();
  private readonly appStore: IAppStore = createAppStore(this.history);

  public render = async () => {
    const appElement = document.getElementById("panpal-web");
    const appJSX = (
      <React.StrictMode>
        <Provider store={this.appStore}>
          <ConnectedRouter history={this.history}>
            <div>hello!</div>
          </ConnectedRouter>
        </Provider>
      </React.StrictMode>
    );

    if (isServerSideRendering()) {
      await loadableReady(() => {
        ReactDom.hydrate(appJSX, appElement);
      });
    } else {
      ReactDom.render(appJSX, appElement);
    }
  };
}

if (isServer && !isTest) {
  // Test env
  const renderer = new ClientSideRenderer();
  renderer.render();
}
