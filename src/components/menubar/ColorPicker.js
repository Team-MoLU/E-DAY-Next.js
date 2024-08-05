import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPrimaryColor } from "../../redux/reducers/themeSlice";
import styles from "./ColorPicker.module.css";

const ColorPicker = () => {
  const primaryColor = useSelector((state) => state.theme.primaryColor);
  const dispatch = useDispatch();
  const [showPalette, setShowPalette] = useState(false);

  const colorOptions = [
    "#F94E8B",
    "#F67280",
    "#F47A60",
    "#CDA235",
    "#69AB6F",
    "#6A76FB",
    "#7850EA",
  ];

  const handleColorChange = (color) => {
    dispatch(setPrimaryColor(color));
    setShowPalette(false);
  };

  return (
    <div className={styles.colorPicker}>
      <button
        className={styles.colorButton}
        style={{ backgroundColor: primaryColor }}
        onClick={() => setShowPalette(!showPalette)}
      />
      {showPalette && (
        <div className={styles.palette}>
          {colorOptions.map((color, index) => (
            <button
              key={index}
              className={`${styles.colorOption} ${
                color === primaryColor ? styles.selected : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
