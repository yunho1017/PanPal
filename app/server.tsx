import * as React from "react";

export class ServerSideRenderer {
  public render = async () => {
    return <div>hello!</div>;
  };
}

const renderer = new ServerSideRenderer();
renderer.render();
