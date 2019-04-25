import "./page.scss";

const Page = ({ children, type = "default" }) => (
  <section className={`global-content ${type}`}>
    <div className="page">{children}</div>
  </section>
);

Page.propTypes = {
  children: PropTypes.any,
  type: PropTypes.string
};

export default Page;
