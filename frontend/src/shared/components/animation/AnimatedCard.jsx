import { motion, useReducedMotion } from "framer-motion";

const MOTION_TAGS = {
    article: motion.article,
    div: motion.div,
    figure: motion.figure,
    section: motion.section,
};

function AnimatedCard({ as = "div", children, className = "", delay = 0, amount = 0.18, ...props }) {
    const reduceMotion = useReducedMotion();
    const MotionTag = MOTION_TAGS[as] || motion.div;

    return (
        <MotionTag
            className={className}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount }}
            transition={{ duration: 0.45, delay, ease: "easeOut" }}
            {...props}
        >
            {children}
        </MotionTag>
    );
}

export default AnimatedCard;
