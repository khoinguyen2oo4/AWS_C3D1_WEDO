import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

function DarkSelect({
    label,
    value,
    onChange,
    options,
    icon: Icon,
    disabled = false,
    menuWidth = "",
}) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const selectedOption = useMemo(() => {
        return options.find((option) => (option.value ?? option.key) === value) || options[0] || null;
    }, [options, value]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            const clickedInsideRoot = rootRef.current?.contains(event.target);
            const clickedInsideMenu = menuRef.current?.contains(event.target);

            if (!clickedInsideRoot && !clickedInsideMenu) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useLayoutEffect(() => {
        if (!open || disabled || !buttonRef.current) {
            return;
        }

        const updatePosition = () => {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuStyle({
                position: "fixed",
                top: `${rect.bottom + 6}px`,
                left: `${rect.left}px`,
                width: menuWidth || `${rect.width}px`,
                zIndex: 80,
            });
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open, disabled, menuWidth]);

    return (
        <div ref={rootRef} className="relative block overflow-visible">
            {label ? <span className="ui-label">{label}</span> : null}
            <button
                type="button"
                onClick={() => {
                    if (!disabled) {
                        setOpen((current) => !current);
                    }
                }}
                ref={buttonRef}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                className="ui-select-trigger"
            >
                {Icon ? <Icon size={16} className="ui-text-accent shrink-0" /> : null}
                <span className="min-w-0 flex-1 truncate font-medium">
                    {selectedOption?.label ?? selectedOption?.title ?? "Chọn giá trị"}
                </span>
                <ChevronDown
                    size={16}
                    className={["ui-text-faint shrink-0 transition", open ? "rotate-180" : ""].join(" ")}
                />
            </button>

            {open && !disabled && typeof document !== "undefined"
                ? createPortal(
                      <div
                          ref={menuRef}
                          aria-hidden={!open || disabled}
                          style={menuStyle || undefined}
                          className="ui-select-menu"
                      >
                          <div className="max-h-64 overflow-auto p-1.5">
                              {options.map((option) => {
                                  const optionValue = option.value ?? option.key;
                                  const active = optionValue === value;
                                  const isDisabled = Boolean(option.disabled);

                                  return (
                                      <button
                                          key={optionValue}
                                          type="button"
                                          disabled={isDisabled}
                                          onClick={() => {
                                              if (isDisabled) return;
                                              onChange(optionValue);
                                              setOpen(false);
                                          }}
                                          className={[
                                              "ui-select-option",
                                              active ? "ui-select-option-active" : "",
                                              isDisabled ? "cursor-not-allowed opacity-50" : "",
                                          ].join(" ")}
                                      >
                                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
                                          <span className="min-w-0 flex-1">
                                              <span className="block font-semibold">
                                                  {option.label ?? option.title}
                                              </span>
                                              {option.hint ? (
                                                  <span className="ui-text-faint mt-0.5 block text-xs leading-snug">
                                                      {option.hint}
                                                  </span>
                                              ) : null}
                                          </span>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>,
                      document.body
                  )
                : null}
        </div>
    );
}

export default DarkSelect;
