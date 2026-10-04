import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Toasts ("201 Booked: ...") and the confirm dialog, available from any page.
const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const timer = useRef();

  const showToast = useCallback((code, text) => {
    clearTimeout(timer.current);
    setToast({ code: String(code), text });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // const ok = await confirm({ title, body, cta })
  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    [],
  );

  const close = (answer) => {
    dialog?.resolve(answer);
    setDialog(null);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {dialog && (
        <div className="overlay" onClick={() => close(false)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title" id="dialog-title">{dialog.title}</div>
            <div className="dialog-body">{dialog.body}</div>
            <div className="dialog-actions">
              <button className="btn btn-red" onClick={() => close(true)} autoFocus>{dialog.cta}</button>
              <button className="btn btn-outline" onClick={() => close(false)}>Keep it</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-code">{toast.code}</span>
          <span className="toast-text">{toast.text}</span>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => useContext(FeedbackContext);
