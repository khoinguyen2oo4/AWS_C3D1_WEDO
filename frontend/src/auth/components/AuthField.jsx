function AuthField({ icon: Icon, label, ...props }) {
    return (
        <label className="auth-field block">
            <span className="ui-label mb-2 text-[10px] font-bold uppercase tracking-[0.18em]">
                {label}
            </span>
            <div className="ui-field rounded-xl px-3 py-2">
                {Icon ? <Icon size={15} className="ui-text-accent shrink-0" /> : null}
                <input {...props} className="ui-input min-w-0 flex-1 text-sm" />
            </div>
        </label>
    );
}

export default AuthField;
