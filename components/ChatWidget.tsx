import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send } from 'lucide-react';
import { C, F } from '../tokens';
import { getLangFromPath, withLangPrefix } from '../i18n/useLocalizedNav';

type Msg = { role: 'user' | 'assistant'; text: string };

const STORAGE_KEY = 'ravio_chat_v1';

const TEXTS = {
  az: {
    open: 'Köməkçi ilə yazış',
    close: 'Bağla',
    title: 'Ravio köməkçisi',
    sub: 'Hədiyyə seçməkdə kömək edir',
    hello: 'Salam! Mən Ravio köməkçisiyəm. Hədiyyə seçimi, qiymət, çatdırılma barədə soruşa bilərsiniz.',
    placeholder: 'Sualınızı yazın...',
    send: 'Göndər',
    view: 'Məhsula bax',
    chips: ['Kişiyə hədiyyə tövsiyə et', 'Çatdırılma necədir?', '30 manata qədər nə var?'],
    busy: 'Hazırda çoxlu sual var. Bir neçə saniyə sonra yenidən yazın.',
    error: 'Cavab almaq alınmadı. Zəhmət olmasa yenidən cəhd edin.',
  },
  en: {
    open: 'Chat with assistant',
    close: 'Close',
    title: 'Ravio assistant',
    sub: 'Helps you choose a gift',
    hello: 'Hi! I am the Ravio assistant. Ask me about gift ideas, prices or delivery.',
    placeholder: 'Type your question...',
    send: 'Send',
    view: 'View product',
    chips: ['Gift idea for a man', 'How does delivery work?', 'What is under 30 AZN?'],
    busy: 'Many questions right now. Please try again in a few seconds.',
    error: 'Could not get a reply. Please try again.',
  },
} as const;

// Cavabdakı ravio.az linklərini sayt daxilində açılan linklərə çevirir.
const LINK_RE = /(https?:\/\/(?:www\.)?ravio\.az)?(\/(?:en\/)?(?:mehsullar|kime|catdirilma|haqqimizda)[A-Za-z0-9\-_/]*)/g;

// Cavabdakı **qalın** işarələrini və ravio.az linklərini göstərir.
function renderInline(line: string, onLink: (path: string) => void, linkLabel: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach((part, pi) => {
    const bold = part.startsWith('**') && part.endsWith('**') && part.length > 4;
    const plain = bold ? part.slice(2, -2) : part.replace(/\*/g, '');
    const nodes: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(plain)) !== null) {
      if (m.index > last) nodes.push(plain.slice(last, m.index));
      const path = m[2].replace(/\/$/, '');
      nodes.push(
        <a
          key={`${keyBase}-${pi}-${m.index}`}
          href={path}
          onClick={(e) => {
            e.preventDefault();
            onLink(path);
          }}
          style={{ color: C.primaryText, textDecoration: 'underline', fontWeight: 600 }}
        >
          {linkLabel}
        </a>
      );
      last = m.index + m[0].length;
    }
    if (last < plain.length) nodes.push(plain.slice(last));
    out.push(bold ? <strong key={`${keyBase}-b${pi}`}>{nodes}</strong> : <span key={`${keyBase}-s${pi}`}>{nodes}</span>);
  });
  return out;
}

// Cavabı səliqəli bloklara bölür: hər siyahı sətri ayrıca, aralarında məsafə ilə.
function renderText(text: string, onLink: (path: string) => void, linkLabel: string): ReactNode[] {
  const lines = text.replace(/\r/g, '').split('\n');
  const out: ReactNode[] = [];
  let prevBlank = false;
  lines.forEach((raw, i) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      prevBlank = true;
      return;
    }
    const isItem = /^([*\-•]|\d+[.)])\s+/.test(trimmed);
    const content = trimmed.replace(/^#+\s*/, '').replace(/^([*\-•])\s+/, '• ');
    const marginTop = out.length === 0 ? 0 : isItem || prevBlank ? 12 : 3;
    out.push(
      <div key={i} style={{ marginTop }}>
        {renderInline(content, onLink, linkLabel, String(i))}
      </div>
    );
    prevBlank = false;
  });
  return out;
}

export default function ChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = getLangFromPath(location.pathname);
  const t = TEXTS[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.slice(-20) : [];
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* sessionStorage bağlıdırsa problem deyil */
    }
  }, [messages]);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const goTo = useCallback(
    (path: string) => {
      const clean = path.replace(/^\/en(?=\/|$)/, '') || '/';
      setOpen(false);
      navigate(withLangPrefix(clean, lang));
    },
    [navigate, lang]
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 600);
      if (!text || loading) return;
      const next: Msg[] = [...messages, { role: 'user', text }];
      setMessages(next);
      setInput('');
      setLoading(true);
      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next.slice(-10), lang }),
        });
        if (res.status === 429) {
          setMessages([...next, { role: 'assistant', text: t.busy }]);
        } else if (!res.ok) {
          setMessages([...next, { role: 'assistant', text: t.error }]);
        } else {
          const data = await res.json();
          setMessages([...next, { role: 'assistant', text: String(data.reply || t.error) }]);
        }
      } catch {
        setMessages([...next, { role: 'assistant', text: t.error }]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, lang, t]
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label={t.open}
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 800,
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: C.primary,
            color: C.white,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
          }}
        >
          <MessageCircle size={26} aria-hidden="true" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 800,
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(540px, calc(100dvh - 24px))',
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: F.sans,
          }}
        >
          <div
            style={{
              background: C.black,
              color: C.white,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{t.sub}</div>
            </div>
            <button
              type="button"
              aria-label={t.close}
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: C.white, cursor: 'pointer', padding: 6 }}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 12,
              background: C.bg,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Bubble role="assistant">{t.hello}</Bubble>

            {messages.length === 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {t.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    style={{
                      border: `1px solid ${C.borderMid}`,
                      background: C.white,
                      borderRadius: 999,
                      padding: '7px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: F.sans,
                      color: C.black,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === 'assistant' ? renderText(m.text, goTo, t.view) : m.text}
              </Bubble>
            ))}

            {loading && <Bubble role="assistant">...</Bubble>}

          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{ display: 'flex', gap: 8, padding: 10, borderTop: `1px solid ${C.border}`, background: C.white }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              maxLength={600}
              aria-label={t.placeholder}
              style={{
                flex: 1,
                border: `1px solid ${C.borderMid}`,
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 16,
                fontFamily: F.sans,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t.send}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: 'none',
                background: C.primary,
                color: C.white,
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: ReactNode }) {
  const mine = role === 'user';
  return (
    <div
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '86%',
        background: mine ? C.black : C.white,
        color: mine ? C.white : C.black,
        border: mine ? 'none' : `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '9px 12px',
        fontSize: 14,
        lineHeight: 1.45,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </div>
  );
}
