
import { useState } from "react";

function Star({ filled, half }) {
  const d = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  if (half) {
    return (
      <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <path d={d} />
      </svg>
    );
  }

  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d={d} />
    </svg>
  );
}

export default function App() {
  const [rating, setRating] = useState(0);

  const handleStarClick = (e, index) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const isHalf = x < width / 2;
    setRating(isHalf ? index + 0.5 : index + 1);
  };

  return (
    <div className="text-white p-4 min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6">Cultural Tracker</h1>
      <div className="mb-4">
        <label className="block text-sm mb-2">Rating</label>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} onClick={(e) => handleStarClick(e, i)}>
              <Star filled={rating >= i + 1} half={rating === i + 0.5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
