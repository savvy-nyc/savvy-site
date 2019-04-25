import routes from "../../routes";

const { Link } = routes;

const NavLink = ({ children, to, params, ...props }) => {
  return (
    <Link to={to} params={params} href="">
      <a {...props}>{children}</a>
    </Link>
  );
};

export default NavLink;
