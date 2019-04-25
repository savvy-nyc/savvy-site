import "normalize.css/normalize.css";
import "./layout.scss";

import Meta from "../components/meta/meta";
import SiteNav from "../components/nav/nav.jsx";
import SiteFooter from "../components/footer/footer.jsx";
import Page from "../components/page/page.jsx";

const Default = ({ children, meta, type = "default" }) => (
  <main>
    <Meta props={meta} />
    <SiteNav />
    <Page type={type}>{children}</Page>
    <SiteFooter />
  </main>
);

Default.propTypes = {
  children: PropTypes.any,
  meta: PropTypes.object,
  type: PropTypes.string
};

export default Default;
