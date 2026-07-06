import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="flex items-center justify-between w-full px-4 py-3">
      <Link to="/" className="font-bold text-gray-800">
        🍄 독버섯 판별기
      </Link>
      <div className="flex gap-4 text-sm text-gray-600">
        <Link to="/" className="hover:text-red-600">홈</Link>
        <Link to="/about" className="hover:text-red-600">소개</Link>
      </div>
    </nav>
  );
}

export default NavBar;