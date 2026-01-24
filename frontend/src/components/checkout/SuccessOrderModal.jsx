import { useEffect, useState } from "react";
import Link from "next/link";

const AUTO_CLOSE_SEC = 20;

const SuccessOrderModal = ({ open, onClose, orderId }) => {
     const [left, setLeft] = useState(AUTO_CLOSE_SEC);
 
  useEffect(() => {
    if (!open) return;

    setLeft(AUTO_CLOSE_SEC);

    const timer = setTimeout(() => onClose?.(), AUTO_CLOSE_SEC * 1000);
    const tick = setInterval(() => {
      setLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="som-backdrop" onClick={onClose} />
    
      {/* Modal */}
      <div className="som-modal" role="dialog" aria-modal="true">
        <div className="som-card">
          <div className="som-top" />

          <div className="som-confetti">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="dot" />
            ))}
          </div>

          <div className="som-icon-wrap">
            <div className="som-icon">✓</div>
          </div>

          <h2 className="som-title">Order Placed Successfully 🎉</h2>
          <p className="som-desc">
            Your order is confirmed! We’ll notify you once it’s shipped.
          </p>

          {orderId ? (
            <div className="som-orderid">
              <div>
                <div className="lbl">Order ID</div>
                <div className="val">{orderId}</div>
              </div>

              <button
                type="button"
                className="copy"
                onClick={() => navigator.clipboard.writeText(String(orderId))}
              >
                Copy
              </button>
            </div>
          ) : null}

          <div className="som-actions">
            {/* ✅ Attractive gradient button */}
            <Link
              href="/shop"
              className="som-btn som-btn-primary"
              onClick={onClose}
            >
              <span className="shine" />
              <span className="btn-text">Continue Shopping</span>
              <span className="arrow">→</span>
            </Link>

            {/* ✅ Ghost button improved */}
            <button
              type="button"
              className="som-btn som-btn-ghost"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {/* ✅ countdown */}
          <p className="som-timer">Auto closing in {left} seconds…</p>

          {/* ✅ progress bar */}
          <div className="som-progress">
            <div
              className="som-progress-bar"
              style={{ width: `${(left / AUTO_CLOSE_SEC) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .som-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.7);
          z-index: 9998;
          animation: somFadeIn 180ms ease-out;
          backdrop-filter: blur(6px);
        }

        .som-modal {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 18px;
        }

        .som-card {
          width: 100%;
          max-width: 620px;
          background: #fff;
          border-radius: 22px;
          padding: 26px 24px 18px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
          transform-origin: center;
          animation: somPop 260ms ease-out;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .som-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 86px;
          background: linear-gradient(135deg, #22c55e, #16a34a, #0ea5e9);
          opacity: 0.95;
          animation: somShift 4s ease-in-out infinite;
        }

        .som-card::before {
          content: "";
          position: absolute;
          right: -140px;
          bottom: -140px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.25), transparent 60%);
          filter: blur(4px);
          animation: somFloat 3.2s ease-in-out infinite;
        }

        .som-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.8;
        }

        .dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          top: 10px;
          left: 20px;
          animation: somDrop 1.6s ease-in-out infinite;
        }

        .dot:nth-child(1) { left: 30px; top: 16px; animation-delay: 0ms; }
        .dot:nth-child(2) { left: 90px; top: 38px; animation-delay: 80ms; }
        .dot:nth-child(3) { left: 150px; top: 22px; animation-delay: 140ms; }
        .dot:nth-child(4) { left: 220px; top: 50px; animation-delay: 200ms; }
        .dot:nth-child(5) { left: 280px; top: 18px; animation-delay: 260ms; }
        .dot:nth-child(6) { left: 350px; top: 46px; animation-delay: 320ms; }
        .dot:nth-child(7) { left: 420px; top: 20px; animation-delay: 380ms; }
        .dot:nth-child(8) { left: 500px; top: 44px; animation-delay: 440ms; }
        .dot:nth-child(9) { left: 560px; top: 24px; animation-delay: 520ms; }
        .dot:nth-child(10) { left: 70px; top: 64px; animation-delay: 560ms; }
        .dot:nth-child(11) { left: 140px; top: 68px; animation-delay: 620ms; }
        .dot:nth-child(12) { left: 210px; top: 72px; animation-delay: 680ms; }
        .dot:nth-child(13) { left: 300px; top: 70px; animation-delay: 740ms; }
        .dot:nth-child(14) { left: 390px; top: 64px; animation-delay: 800ms; }
        .dot:nth-child(15) { left: 460px; top: 72px; animation-delay: 860ms; }
        .dot:nth-child(16) { left: 540px; top: 64px; animation-delay: 920ms; }
        .dot:nth-child(17) { left: 25px; top: 74px; animation-delay: 980ms; }
        .dot:nth-child(18) { left: 585px; top: 74px; animation-delay: 1040ms; }

        .som-icon-wrap {
          display: grid;
          place-items: center;
          margin-top: 46px;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .som-icon {
          width: 88px;
          height: 88px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 40px;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 16px 38px rgba(34, 197, 94, 0.4);
          animation: somPulse 1.15s ease-in-out infinite;
        }

        .som-title {
          text-align: center;
          font-size: 28px;
          font-weight: 900;
          margin: 8px 0 8px;
          color: #0f172a;
          position: relative;
          z-index: 1;
        }

        .som-desc {
          text-align: center;
          margin: 0 24px 18px;
          color: #475569;
          line-height: 1.6;
          font-size: 15.5px;
          position: relative;
          z-index: 1;
        }

        .som-orderid {
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 16px;
          padding: 14px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 10px 18px;
          background: rgba(34, 197, 94, 0.08);
          position: relative;
          z-index: 1;
        }

        .lbl {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 2px;
          font-weight: 700;
        }

        .val {
          font-size: 16px;
          color: #0f172a;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .copy {
          border: 0;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.12);
          color: #0f172a;
          font-weight: 900;
          cursor: pointer;
          transition: transform 120ms ease, opacity 120ms ease;
        }
        .copy:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .som-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
          margin-top: 6px;
        }

        /* ✅ Premium button base */
        .som-btn {
          border: 0;
          outline: none;
          padding: 13px 18px;
          border-radius: 16px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 140ms ease, opacity 140ms ease, box-shadow 140ms ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 190px;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        /* ✅ Gradient + glow + shine */
        .som-btn-primary {
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #0ea5e9);
          box-shadow: 0 18px 44px rgba(2, 132, 199, 0.22);
        }

        .som-btn-primary .shine {
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle, rgba(255,255,255,0.35), transparent 55%);
          transform: translateX(-40%);
          animation: shineMove 2.2s ease-in-out infinite;
          pointer-events: none;
        }

        .btn-text {
          position: relative;
          z-index: 2;
        }

        .arrow {
          position: relative;
          z-index: 2;
          font-size: 18px;
          font-weight: 900;
          transform: translateX(0);
          transition: transform 140ms ease;
        }

        .som-btn-primary:hover .arrow {
          transform: translateX(3px);
        }

        .som-btn-ghost {
          background: rgba(15, 23, 42, 0.06);
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.12);
        }

        .som-btn:hover {
          transform: translateY(-2px);
          opacity: 0.98;
        }

        .som-btn-primary:hover {
          box-shadow: 0 22px 60px rgba(2, 132, 199, 0.28);
        }

        .som-timer {
          text-align: center;
          margin: 14px 0 8px;
          font-size: 12px;
          color: #94a3b8;
          position: relative;
          z-index: 1;
        }

        .som-progress {
          height: 8px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
          overflow: hidden;
          position: relative;
          z-index: 1;
          margin: 0 12px 6px;
        }

        .som-progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #22c55e, #0ea5e9, #1d4ed8);
          transition: width 400ms linear;
        }

        @keyframes somFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes somPop {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes somPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }

        @keyframes somFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-16px, -12px); }
        }

        @keyframes somDrop {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(8px); opacity: 0.75; }
        }

        @keyframes somShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(20deg); }
        }

        @keyframes shineMove {
          0%, 100% { transform: translateX(-35%); opacity: 0.7; }
          50% { transform: translateX(35%); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SuccessOrderModal;
