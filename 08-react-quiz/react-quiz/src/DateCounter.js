import { useState } from "react";

function DateCounter() {
  const [step, setStep] = useState(0);

  return (
    <div className="counter">
      <div>
        <input
          type="range"
          min="0"
          max="10"
          value={step}
          onChange={(e) => setStep(e.target.value)}
        />
        <span>{step}</span>
      </div>

      <div>
        <button onClick={dec}>-</button>
        <input />
        <button onClick={inc}>+</button>
      </div>
    </div>
  );
}

export default DateCounter;
