import React from "react";
import styles from "./ToggleButton.module.css";

const ToggleButton = ({ isOn, onToggle }) => {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={isOn}
        onChange={onToggle}
        className={styles.input}
      />
      <span className={`${styles.slider} ${isOn ? styles.on : ""}`}>
        <span className={styles.knob}></span>
      </span>
    </label>
  );
};

export default ToggleButton;
