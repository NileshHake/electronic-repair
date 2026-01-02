// components/RecoveryButton.js
import Link from "next/link";

const RecoveryButton = () => {
  return (
    <Link href="/recovery">
      <button className="btn  btn-sm btn-success">
        Data Recovery
      </button>

      
    </Link>
  );
};

export default RecoveryButton;
