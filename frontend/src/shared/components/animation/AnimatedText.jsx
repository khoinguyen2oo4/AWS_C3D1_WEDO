function AnimatedText({
    as: Tag = "h1",
    lines,
    children,
    className = "",
    lineClassName = "",
    accentClassName = "",
    accentIndexes = [],
}) {
    const contentLines = Array.isArray(lines) && lines.length > 0 ? lines : [children].filter(Boolean);

    return (
        <Tag className={className}>
            {contentLines.map((line, index) => {
                const isAccent = accentIndexes.includes(index);
                return (
                    <span
                        key={`${line}-${index}`}
                        className={`block ${lineClassName} ${isAccent ? accentClassName : ""}`}
                    >
                        {line}
                    </span>
                );
            })}
        </Tag>
    );
}

export default AnimatedText;
