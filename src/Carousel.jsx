import { useState} from "react";

const slides = [
    {
        image: "/huddle-team.jpg",
        title: "Great teams build together",
        caption: " Chat, share ideas, and stay connected."
    },
    {
        image: "/huddle-team 2.jpg",
        title: "Real-time collaboration",
        caption: " Communicate seamlessly with your team in real-time."
    }
];                                  

function Carousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const slide = slides[activeIndex];

    return (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md">
            <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                />

                {/* Dark gradient so text is readable over the photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                {/* text overlay */}
                <div className="absolute bottom-8 left-4 right-4 text-white text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                     Huddle
                    </p>
                    <h3 className="text-lg font-bold leading-snug">{slide.title}</h3>
                    <p className="text-sm opacity-90">{slide.caption}</p>
                </div>

{/* Dot indicators */}
<div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
    {slides.map((_, index) => (
        <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${index === activeIndex ? ' w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
        />
    ))}
</div>

</div>
    );
}

export default Carousel;