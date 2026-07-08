import { useEffect, useState } from "react";

export function useCountAnimation(value: number = 0, duration: number = 1000) {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        const startTime = performance.now();

        function animate(currentTime: number) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            setAnimatedValue(Number((value * progress).toFixed(2)));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);

    }, [value, duration]);

    return animatedValue;
}