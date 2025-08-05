import { useState } from 'react';

export default function Courses() {
  const [purchased, setPurchased] = useState(false);
  
  return (
    <div>
      <h1>Available Courses</h1>
      <button className="course-btn">Blockchain 101</button>
      <button 
        id="pay-with-edu"
        onClick={() => setPurchased(true)}
      >
        Pay with EDU
      </button>
      {purchased && <div className="purchase-confirmed">Payment successful!</div>}
    </div>
  );
}