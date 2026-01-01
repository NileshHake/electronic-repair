    import React, { useMemo } from "react";
import { ICONS } from "../../icons";

const StoreFeatureIconGrid = ({
  iconSearch,
  featureData,
  setFeatureData,
}) => {
  const filteredIcons = useMemo(() => {
    return Object.keys(ICONS)
      .filter((key) =>
        key.toLowerCase().includes(iconSearch.toLowerCase())
      )
      .slice(0, 60); // limit icons
  }, [iconSearch]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
        gap: "10px",
        maxHeight: "260px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "10px",
      }}
    >
      {filteredIcons.map((key) => {
        const Icon = ICONS[key];
        const active = featureData.icon === key;

        return (
          <div
            key={key}
            onClick={() =>
              setFeatureData((prev) => ({ ...prev, icon: key }))
            }
            style={{
              cursor: "pointer",
              border: active ? "2px solid #0d6efd" : "1px solid #ccc",
              background: active ? "#e7f1ff" : "#fff",
              borderRadius: "6px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <Icon size={28} />
            <div style={{ fontSize: "10px", marginTop: "5px" }}>
              {key}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StoreFeatureIconGrid;
