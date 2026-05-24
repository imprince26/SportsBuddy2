import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const getScrollKey = (location) => location.pathname;

const ScrollToTop = () => {
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        const scrollKey = getScrollKey(location);
        const savedPosition = sessionStorage.getItem(`scroll:${scrollKey}`);

        requestAnimationFrame(() => {
            if (navigationType === "POP" && savedPosition) {
                window.scrollTo(0, Number(savedPosition));
                return;
            }

            window.scrollTo(0, 0);
        });

        return () => {
            sessionStorage.setItem(`scroll:${scrollKey}`, String(window.scrollY));
        };
    }, [location.pathname, navigationType]);

    return null;
}
    
export default ScrollToTop
