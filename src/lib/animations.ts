
import { useEffect, useState } from 'react';

// Trigger animation when element is visible in viewport
export const useInView = (ref: React.RefObject<HTMLElement>, options = {}) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isInView;
};

// Stagger animation for multiple elements
export const useStaggeredAnimation = (
  elements: HTMLElement[],
  baseDelay = 100,
  animation = 'animate-slide-up'
) => {
  useEffect(() => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(animation);
      }, baseDelay * index);
    });
  }, [elements, baseDelay, animation]);
};

// Smooth scroll to section
export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 80, // Adjust for header height
      behavior: 'smooth'
    });
  }
};
