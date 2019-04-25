import { initializeStore } from "../reducers/store";
import { calculateResponsiveState } from "redux-responsive";

const isServer = typeof window === "undefined";
const __NEXT_REDUX_STORE__ = "__NEXT_REDUX_STORE__";

function getOrCreateStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

// eslint-disable-next-line arrow-body-style
export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrCreateStore();

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore;

      let appProps = {};
      if (typeof App.getInitialProps === "function") {
        appProps = await App.getInitialProps(appContext);
      }
      let rxStore = reduxStore.getState();
      let query = {
        nextParams: appContext.ctx.query
      };

      return {
        ...appProps,
        initialReduxState: { ...rxStore, ...query }
      };
    }

    constructor(props) {
      super(props);
      // eslint-disable-next-line react/prop-types
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    componentDidMount() {
      if (!isServer) {
        this.reduxStore.dispatch(calculateResponsiveState(window));
      }
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />;
    }
  };
};
