// components/RepairButton.js
import Link from "next/link";

const RepairButton = () => {
  return (
    <Link href="/repair">
      <button className="btn btn-sm btn-danger">
          Repair  Device
      </button>

      
    </Link>
  );
};

export default RepairButton;
