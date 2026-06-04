import { Link } from "react-router-dom";

export default function Home () {
  return (
    <div>
      <Link
          to="/authenticate"
          className=" bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
      >
          Authenticate
      </Link>
    </div>
  )
}