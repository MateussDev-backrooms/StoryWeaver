export interface ValidationResult {
    state: "";

    textareaProps: {
        onInput: (e: React.InputEvent<HTMLTextAreaElement>) => void;
        onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
        onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
        onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
        onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    };

    dropdownProps: {
        
    }
}