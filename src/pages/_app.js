import NextApp, { Container } from "next/app";
import withReduxStore from "../helpers/redux";
import { setMobileDetect, mobileParser } from "react-responsive-redux";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-next-router";

class App extends NextApp {
  componentDidMount() {
    this.setResponsive(window.navigator.userAgent);
    window.addEventListener("resize", () => {
      this.setResponsive(navigator.userAgent);
    });
  }

  setResponsive = userAgent => {
    let { reduxStore } = this.props;
    let responsive = setMobileDetect(
      mobileParser({
        headers: {
          "User-Agent": userAgent
        }
      })
    );
    reduxStore.dispatch(responsive);
  };

  render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <Container>
        <Provider store={reduxStore}>
          <ConnectedRouter>
            <Component {...pageProps} />
          </ConnectedRouter>
        </Provider>
      </Container>
    );
  }
}

export default withReduxStore(App);
