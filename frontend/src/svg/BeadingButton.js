// components/BeadingButton.js
import Link from "next/link";

const BeadingButton = () => {
  return (
    <Link href="/beading">
      <button className="btn btn-sm btn-warning">
        Beading Device
      </button>
    </Link>
  );
};

export default BeadingButton;
