import { useState } from "react";
import { MessageSquare } from "lucide-react";

const slides = [
  {
    image: "/huddle-team.jpg",
    title: "Great teams build together",
    caption: "Chat, share ideas, and stay connected.",
  },
  {
    image: "/huddle-team 2.jpg",
    title: "Real-time collaboration",
    caption: "Communicate seamlessly with your team in real-time.",
  },
];

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];

  return (
    <div className="space-y-3 w-full">
      <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />

<div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-transparent p-4 flex flex-col justify-start text-left">
  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C54E5] mb-2 bg-white px-2.5 py-1 rounded-full w-max shadow-md">
    <MessageSquare className="h-3.5 w-3.5 fill-[#5C54E5] text-[#5C54E5]" />
    <span>Huddle</span>
  </div>
  <h3 className="text-xl font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
    {slide.title}
  </h3>
  <p className="text-xs font-semibold text-gray-100 mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
    {slide.caption}
  </p>
</div>
      </div>

      <div className="flex justify-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex ? "w-2 bg-[#5C54E5]" : "w-2 bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;