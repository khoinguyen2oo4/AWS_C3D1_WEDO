import { motion, useReducedMotion } from "framer-motion";

const MOTION_TAGS = {
    div: motion.div,
    span: motion.span,
};

function FloatingImage({ as = "div", children, className = "", intensity = 5, delay = 0, ...props }) {
    const reduceMotion = useReducedMotion();
    const MotionTag = MOTION_TAGS[as] || motion.div;

    return (
        <MotionTag
            className={className}
            animate={reduceMotion ? undefined : { y: [0, -intensity, 0], rotate: [0, 0.35, 0] }}
            transition={{
                duration: 4.2,
                delay,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            }}
            {...props}
        >
            {children}
        </MotionTag>
    );
}

export default FloatingImage;
