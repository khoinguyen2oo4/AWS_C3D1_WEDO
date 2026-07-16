import { motion, useReducedMotion } from "framer-motion";

function AnimatedButton({
    as: Component = "button",
    children,
    className = "",
    wrapperClassName = "",
    disabled = false,
    type,
    ...props
}) {
    const reduceMotion = useReducedMotion();
    const hover = reduceMotion || disabled ? undefined : { scale: 1.025, x: [0, -1, 1, -1, 0] };
    const tap = reduceMotion || disabled ? undefined : { scale: 0.985 };

    if (Component === "button") {
        return (
            <motion.button
                type={type || "button"}
                disabled={disabled}
                className={className}
                whileHover={hover}
                whileTap={tap}
                transition={{ duration: 0.22, ease: "easeOut" }}
                {...props}
            >
                {children}
            </motion.button>
        );
    }

    return (
        <motion.span
            className={`inline-flex ${wrapperClassName}`}
            whileHover={hover}
            whileTap={tap}
            transition={{ duration: 0.22, ease: "easeOut" }}
        >
            <Component className={className} {...props}>
                {children}
            </Component>
        </motion.span>
    );
}

export default AnimatedButton;
