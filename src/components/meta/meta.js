import Head from "next/head";
import favicon from "./favicons/32x32.png";

const Meta = ({ title, description }) => (
  <div>
    <Head>
      <meta charSet="utf-8" />
      <title>{title || "Savvy"}</title>
      <meta name="description" content={description || "Savvy description"} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href={favicon} />
    </Head>
  </div>
);

Meta.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};

export default Meta;
